import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import TabNav from './components/TabNav'
import BottomNav from './components/BottomNav'
import BranchFilter from './components/BranchFilter'
import DateRangeFilter from './components/DateRangeFilter'
import OverviewPage from './pages/OverviewPage'
import CustomersPage from './pages/CustomersPage'
import Lab2Page from './pages/Lab2Page'
import { parseSalesCsv, parseCustomersCsv, getBranchSales } from './lib/metrics'
import { filterRows, filterCustomers, getDateBounds, getPreviousPeriodRows } from './lib/filters'
import { branchToSlug, slugToBranch } from './lib/theme'

const parseProductsCsv = (text) => Papa.parse(text, { header: true, skipEmptyLines: true }).data

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
  const [customers, setCustomers] = useState(null)
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)

  const initial = useMemo(parseHash, [])
  const [tab, setTab] = useState(initial.tab)
  const [branch, setBranch] = useState(initial.branch)
  const [dateRange, setDateRange] = useState({ from: initial.from, to: initial.to })

  useEffect(() => {
    Promise.all([
      fetch('/sales.csv').then((res) => res.text()),
      fetch('/customers.csv').then((res) => res.text()),
      fetch('/products.csv').then((res) => res.text()),
    ])
      .then(([salesText, customersText, productsText]) => {
        setRows(parseSalesCsv(salesText))
        setCustomers(parseCustomersCsv(customersText))
        setProducts(parseProductsCsv(productsText))
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    history.replaceState(null, '', buildHash(tab, branch, dateRange))
  }, [tab, branch, dateRange])

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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-border" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-lg bg-border" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-page pb-20 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-4 p-4 sm:space-y-6 sm:p-8">
        <h1 className="text-2xl leading-9 font-bold text-ink">บ้านบรู Dashboard</h1>

        <TabNav value={tab} onChange={setTab} />

        {tab !== 'lab2' && (
          <div className="sticky top-0 z-[5] flex flex-col gap-4 rounded-lg bg-bg-surface p-4 shadow-sm ring-1 ring-border sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-6">
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
        {tab === 'customers' && (
          <CustomersPage
            rows={filteredRows}
            customers={filteredCustomers}
            resetLabel="ล้างตัวกรอง"
            onReset={resetFilters}
          />
        )}
        {tab === 'lab2' && <Lab2Page rows={rows} products={products} />}
      </div>

      <BottomNav value={tab} onChange={setTab} />
    </div>
  )
}

export default App
