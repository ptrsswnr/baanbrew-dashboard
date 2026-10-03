import { useEffect, useState } from 'react'
import KpiCard from './components/KpiCard'
import SalesLineChart from './components/SalesLineChart'
import BranchBarChart from './components/BranchBarChart'
import CustomerAgeChart from './components/CustomerAgeChart'
import CustomerGenderChart from './components/CustomerGenderChart'
import CustomerBranchChart from './components/CustomerBranchChart'
import NewMembersChart from './components/NewMembersChart'
import TopCustomersTable from './components/TopCustomersTable'
import {
  parseSalesCsv,
  parseCustomersCsv,
  getTotalSales,
  getOrderCount,
  getAverageOrderValue,
  getUniqueMemberCount,
  getDailySales,
  getBranchSales,
  getCustomerCount,
  getActivePurchaserShare,
  getCustomersByAgeGroup,
  getCustomersByGender,
  getCustomersByBranch,
  getNewMembersByMonth,
  getTopCustomersBySpend,
  formatCurrency,
  formatNumber,
  formatPercent,
} from './lib/metrics'

function App() {
  const [rows, setRows] = useState(null)
  const [customers, setCustomers] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/sales.csv').then((res) => res.text()),
      fetch('/customers.csv').then((res) => res.text()),
    ])
      .then(([salesText, customersText]) => {
        setRows(parseSalesCsv(salesText))
        setCustomers(parseCustomersCsv(customersText))
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-red-600">โหลดข้อมูลไม่สำเร็จ: {error}</p>
      </div>
    )
  }

  if (!rows || !customers) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
      </div>
    )
  }

  const dailySales = getDailySales(rows)
  const branchSales = getBranchSales(rows)
  const customersByAgeGroup = getCustomersByAgeGroup(customers)
  const customersByGender = getCustomersByGender(customers)
  const customersByBranch = getCustomersByBranch(customers)
  const newMembersByMonth = getNewMembersByMonth(customers)
  const topCustomers = getTopCustomersBySpend(rows, customers)

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

        <h2 className="pt-4 text-xl font-bold text-slate-800">ข้อมูลลูกค้า</h2>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="สมาชิกทั้งหมด" value={formatNumber(getCustomerCount(customers))} />
          <KpiCard
            label="สมาชิกที่เคยซื้อแล้ว"
            value={formatPercent(getActivePurchaserShare(customers))}
          />
        </div>

        <NewMembersChart data={newMembersByMonth} />

        <div className="grid gap-6 lg:grid-cols-2">
          <CustomerAgeChart data={customersByAgeGroup} />
          <CustomerGenderChart data={customersByGender} />
        </div>

        <CustomerBranchChart data={customersByBranch} />
        <TopCustomersTable data={topCustomers} />
      </div>
    </div>
  )
}

export default App
