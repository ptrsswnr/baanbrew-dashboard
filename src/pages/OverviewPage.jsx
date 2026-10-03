import KpiCard from '../components/KpiCard'
import SalesLineChart from '../components/SalesLineChart'
import BranchBarChart from '../components/BranchBarChart'
import EmptyState from '../components/EmptyState'
import {
  getTotalSales,
  getOrderCount,
  getAverageOrderValue,
  getUniqueMemberCount,
  getDailySales,
  getBranchSales,
  formatCurrency,
  formatNumber,
} from '../lib/metrics'

function OverviewPage({ rows }) {
  if (rows.length === 0) {
    return <EmptyState message="ไม่มีข้อมูลยอดขายในช่วงที่เลือก ลองเปลี่ยนสาขาหรือวันที่" />
  }

  const dailySales = getDailySales(rows)
  const branchSales = getBranchSales(rows)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="ยอดขายรวม" value={formatCurrency(getTotalSales(rows))} />
        <KpiCard label="จำนวนบิล" value={formatNumber(getOrderCount(rows))} />
        <KpiCard label="ยอดเฉลี่ยต่อบิล" value={formatCurrency(getAverageOrderValue(rows))} />
        <KpiCard label="ลูกค้าสมาชิก (ไม่ซ้ำ)" value={formatNumber(getUniqueMemberCount(rows))} />
      </div>

      <SalesLineChart data={dailySales} />
      <BranchBarChart data={branchSales} />
    </div>
  )
}

export default OverviewPage
