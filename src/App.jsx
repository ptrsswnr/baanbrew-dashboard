import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import TabNav from './components/TabNav'
import BranchFilter from './components/BranchFilter'
import DateRangeFilter from './components/DateRangeFilter'
import OverviewPage from './pages/OverviewPage'
import CustomersPage from './pages/CustomersPage'
import Lab2Page from './pages/Lab2Page'
import { parseSalesCsv, parseCustomersCsv, getBranchSales } from './lib/metrics'
import { filterRows, filterCustomers, getDateBounds } from './lib/filters'

const parseProductsCsv = (text) => Papa.parse(text, { header: true, skipEmptyLines: true }).data

function App() {
  const [rows, setRows] = useState(null)
  const [customers, setCustomers] = useState(null)
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState(() => location.hash.slice(1) || 'overview')
  const [branch, setBranch] = useState(null)
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

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

  const chooseTab = (id) => {
    setTab(id)
    history.replaceState(null, '', '#' + id)
  }

  const branches = useMemo(() => (rows ? getBranchSales(rows).map((b) => b.branch) : []), [rows])
  const dateBounds = useMemo(() => (rows ? getDateBounds(rows) : { min: '', max: '' }), [rows])
  const filteredRows = useMemo(() => (rows ? filterRows(rows, branch, dateRange) : []), [rows, branch, dateRange])
  const filteredCustomers = useMemo(
    () => (customers ? filterCustomers(customers, branch, dateRange) : []),
    [customers, branch, dateRange],
  )

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-red-600">โหลดข้อมูลไม่สำเร็จ: {error}</p>
      </div>
    )
  }

  if (!rows || !customers || !products) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">บ้านบรู Dashboard</h1>

        <TabNav value={tab} onChange={chooseTab} />

        {tab !== 'lab2' && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <BranchFilter branches={branches} value={branch} onChange={setBranch} />
            <DateRangeFilter min={dateBounds.min} max={dateBounds.max} value={dateRange} onChange={setDateRange} />
          </div>
        )}

        {tab === 'overview' && <OverviewPage rows={filteredRows} />}
        {tab === 'customers' && <CustomersPage rows={filteredRows} customers={filteredCustomers} />}
        {tab === 'lab2' && <Lab2Page rows={rows} products={products} />}
      </div>
    </div>
  )
}

export default App
