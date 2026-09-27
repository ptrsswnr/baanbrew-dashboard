import { useEffect, useState } from 'react'
import KpiCard from './components/KpiCard'
import SalesLineChart from './components/SalesLineChart'
import BranchBarChart from './components/BranchBarChart'
import {
  parseSalesCsv,
  getTotalSales,
  getOrderCount,
  getAverageOrderValue,
  getUniqueMemberCount,
  getDailySales,
  getBranchSales,
  formatCurrency,
  formatNumber,
} from './lib/metrics'

function App() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/sales.csv')
      .then((res) => res.text())
      .then((text) => setRows(parseSalesCsv(text)))
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-red-600">โหลดข้อมูลไม่สำเร็จ: {error}</p>
      </div>
    )
  }

  if (!rows) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
      </div>
    )
  }

  const dailySales = getDailySales(rows)
  const branchSales = getBranchSales(rows)

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">บ้านบรู Dashboard</h1>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="ยอดขายรวม" value={formatCurrency(getTotalSales(rows))} />
          <KpiCard label="จำนวนบิล" value={formatNumber(getOrderCount(rows))} />
          <KpiCard label="ยอดเฉลี่ยต่อบิล" value={formatCurrency(getAverageOrderValue(rows))} />
          <KpiCard label="ลูกค้าสมาชิก (ไม่ซ้ำ)" value={formatNumber(getUniqueMemberCount(rows))} />
        </div>

        <SalesLineChart data={dailySales} />
        <BranchBarChart data={branchSales} />
      </div>
    </div>
  )
}

export default App
