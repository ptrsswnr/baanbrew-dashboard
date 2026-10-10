import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import TabNav, { TABS } from './components/TabNav'
import BottomNav from './components/BottomNav'
import BranchFilter from './components/BranchFilter'
import DateRangeFilter from './components/DateRangeFilter'
import OverviewPage from './pages/OverviewPage'
import CustomersPage from './pages/CustomersPage'
import Lab2Page from './pages/Lab2Page'
import Critter from './components/Critter'
import OverviewCsv from './lab4/OverviewCsv'
import CustomersTab from './lab4/CustomersTab'
import ForecastTab from './lab4/ForecastTab'
import { firestoreSource, createDemoSource } from './lab3/dataSource'
import LiveTab from './lab3/LiveTab'
import RulesTester from './lab3/RulesTester'
import SetupGuide from './lab3/SetupGuide'
import { isConfigured } from './lab3/firebase'
import { parseSalesCsv, parseCustomersCsv, getBranchSales, prepareRows } from './lib/metrics'
import { filterRows, filterCustomers, getDateBounds, getPreviousPeriodRows } from './lib/filters'
import { branchToSlug, slugToBranch } from './lib/theme'
import { useTheme } from './lib/useTheme'
import ThemeToggle from './components/ThemeToggle'

const parseProductsCsv = (text) => Papa.parse(text, { header: true, skipEmptyLines: true }).data

// เปิดโหมดสาธิต (ไม่ต้องมี Firebase) ด้วย ?demo ตามที่ CLAUDE.md ระบุ
const DEMO = new URLSearchParams(location.search).has('demo')
// แท็บของ Day 4 ที่อ่านผลวิเคราะห์ผ่าน source (Firestore หรือโหมดสาธิต) ไม่ใช้ตัวกรองสาขา/วันที่
const SOURCE_TABS = ['segments', 'forecast']

// #overview?branch=siam&from=2025-07-01&to=2025-07-31 — อ่าน/เขียนสถานะแท็บและตัวกรองใน URL hash
// เพื่อให้แชร์ลิงก์มุมมองปัจจุบันได้ (design.md ส่วน 9)
function parseHash() {
  const [tabPart, queryPart] = location.hash.slice(1).split('?')
  const params = new URLSearchParams(queryPart || '')
  return {
    tab: tabPart || 'overview',
    branch: slugToBranch(params.get('branch')),
    from: params.get('from') || '',
    to: params.get('to') || '',
  }
}

function buildHash(tab, branch, dateRange) {
  const params = new URLSearchParams()
  const slug = branchToSlug(branch)
  if (slug) params.set('branch', slug)
  if (dateRange.from) params.set('from', dateRange.from)
  if (dateRange.to) params.set('to', dateRange.to)
  const query = params.toString()
  return '#' + tab + (query ? '?' + query : '')
}

function App() {
  const [rows, setRows] = useState(null)
  const [csvRows, setCsvRows] = useState(null) // แถวรูปแบบ snake_case จาก prepareRows() สำหรับแท็บ "ภาพรวม (CSV)"
  const [holidays, setHolidays] = useState({}) // { 'YYYY-MM-DD': ชื่อวันหยุด } ใช้ในโหมดสาธิตของแท็บพยากรณ์
  const [customers, setCustomers] = useState(null)
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)
  const { theme, toggle: toggleTheme } = useTheme()

  const initial = useMemo(parseHash, [])
  const [tab, setTab] = useState(initial.tab)
  const [branch, setBranch] = useState(initial.branch)
  const [dateRange, setDateRange] = useState({ from: initial.from, to: initial.to })

  useEffect(() => {
    Promise.all([
      fetch('/sales.csv').then((res) => res.text()),
      fetch('/customers.csv').then((res) => res.text()),
      fetch('/products.csv').then((res) => res.text()),
      fetch('/thai_holidays.csv').then((res) => (res.ok ? res.text() : '')).catch(() => ''),
    ])
      .then(([salesText, customersText, productsText, holidaysText]) => {
        setHolidays(Object.fromEntries(Papa.parse(holidaysText, { header: true, skipEmptyLines: true }).data.map((h) => [h.date, h.holiday])))
        setRows(parseSalesCsv(salesText))
        setCsvRows(prepareRows(Papa.parse(salesText, { header: true, skipEmptyLines: true }).data))
        setCustomers(parseCustomersCsv(customersText))
        setProducts(parseProductsCsv(productsText))
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    history.replaceState(null, '', buildHash(tab, branch, dateRange))
  }, [tab, branch, dateRange])

  // แหล่งข้อมูลของแท็บ Day 4: ?demo คำนวณในเบราว์เซอร์จาก CSV, ไม่งั้นใช้ Firestore ถ้าตั้งค่า .env แล้ว
  const source = useMemo(() => {
    if (DEMO) return csvRows && products ? createDemoSource(csvRows, products, holidays) : null
    return isConfigured ? firestoreSource : null
  }, [csvRows, products, holidays])

  const resetFilters = () => {
    setBranch(null)
    setDateRange({ from: '', to: '' })
  }

  const branches = useMemo(() => (rows ? getBranchSales(rows).map((b) => b.branch) : []), [rows])
  const dateBounds = useMemo(() => (rows ? getDateBounds(rows) : { min: '', max: '' }), [rows])
  const filteredRows = useMemo(() => (rows ? filterRows(rows, branch, dateRange) : []), [rows, branch, dateRange])
  const filteredCustomers = useMemo(
    () => (customers ? filterCustomers(customers, branch, dateRange) : []),
    [customers, branch, dateRange],
  )
  const previousRows = useMemo(
    () => (rows ? getPreviousPeriodRows(rows, branch, dateRange) : null),
    [rows, branch, dateRange],
  )

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-page">
        <p className="text-negative">โหลดข้อมูลไม่สำเร็จ: {error}</p>
      </div>
    )
  }

  if (!rows || !customers || !products) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 p-4 sm:space-y-6 sm:p-8">
        <div className="h-10 w-64 animate-pulse rounded-md bg-border" />
        <div className="h-12 animate-pulse rounded-md bg-border" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-border" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-lg bg-border" />
      </div>
    )
  }

  const current = TABS.find((t) => t.id === tab) || TABS[0]

  return (
    <div className="min-h-screen bg-bg-page pb-20 md:pb-0">
      <div className="mx-auto flex max-w-[1600px] gap-6 p-4 lg:p-6">
        <TabNav value={tab} onChange={setTab} />

        <main className="min-w-0 flex-1 space-y-4 sm:space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl leading-9 font-bold text-ink">{current.title}</h1>
              <p className="text-sm text-ink-muted">{current.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <span className="flex items-center gap-2 rounded-full bg-bg-surface py-1.5 pr-4 pl-1.5 text-sm font-medium text-ink shadow-card">
                <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-series-bangna text-sm font-bold text-white" aria-hidden="true">บ</span>
                บ้านบรู
              </span>
            </div>
          </header>

          {tab !== 'lab2' && tab !== 'live' && tab !== 'rules' && tab !== 'overviewcsv' && !SOURCE_TABS.includes(tab) && (
            <div className="sticky top-2 z-[5] flex flex-col gap-4 rounded-lg bg-bg-surface p-4 shadow-card sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5">
              <BranchFilter branches={branches} value={branch} onChange={setBranch} />
              <DateRangeFilter min={dateBounds.min} max={dateBounds.max} value={dateRange} onChange={setDateRange} />
            </div>
          )}

          {tab === 'overview' && (
            <OverviewPage
              rows={filteredRows}
              previousRows={previousRows}
              onBranchClick={setBranch}
              resetLabel="ล้างตัวกรอง"
              onReset={resetFilters}
            />
          )}
          {tab === 'overviewcsv' && csvRows && <OverviewCsv rows={csvRows} />}
          {tab === 'customers' && (
            <CustomersPage
              rows={filteredRows}
              customers={filteredCustomers}
              resetLabel="ล้างตัวกรอง"
              onReset={resetFilters}
            />
          )}
          {tab === 'lab2' && <Lab2Page rows={rows} products={products} />}
          {tab === 'segments' && (source ? <CustomersTab source={source} /> : !DEMO && <SetupGuide />)}
          {tab === 'forecast' && (source ? <ForecastTab source={source} /> : !DEMO && <SetupGuide />)}
          {tab === 'live' && (isConfigured ? <LiveTab /> : <SetupGuide />)}
          {tab === 'rules' && (isConfigured ? <RulesTester /> : <SetupGuide />)}
        </main>
      </div>

      <BottomNav value={tab} onChange={setTab} />
      <Critter />
    </div>
  )
}

export default App
