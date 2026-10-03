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
  getPercentDelta,
  formatCurrency,
  formatNumber,
  formatPercent,
} from '../lib/metrics'

function buildDelta(current, previous) {
  if (previous == null) return null
  const ratio = getPercentDelta(current, previous)
  if (ratio == null) return null
  const direction = ratio > 0.0005 ? 'up' : ratio < -0.0005 ? 'down' : 'flat'
  return { direction, text: `${formatPercent(Math.abs(ratio))} จากช่วงก่อนหน้า` }
}

function OverviewPage({ rows, previousRows, onBranchClick, resetLabel, onReset }) {
  if (rows.length === 0) {
    return <EmptyState message="ไม่พบข้อมูลในช่วงที่เลือก" actionLabel={resetLabel} onAction={onReset} />
  }

  const dailySales = getDailySales(rows)
  const branchSales = getBranchSales(rows)

  const prevTotals = previousRows
    ? {
        total: getTotalSales(previousRows),
        orders: getOrderCount(previousRows),
        avg: getAverageOrderValue(previousRows),
        members: getUniqueMemberCount(previousRows),
      }
    : null

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          label="ยอดขายรวม"
          value={formatCurrency(getTotalSales(rows))}
          delta={buildDelta(getTotalSales(rows), prevTotals?.total)}
        />
        <KpiCard
          label="จำนวนบิล"
          value={formatNumber(getOrderCount(rows))}
          delta={buildDelta(getOrderCount(rows), prevTotals?.orders)}
        />
        <KpiCard
          label="ยอดเฉลี่ยต่อบิล"
          value={formatCurrency(getAverageOrderValue(rows))}
          delta={buildDelta(getAverageOrderValue(rows), prevTotals?.avg)}
        />
        <KpiCard
          label="ลูกค้าสมาชิก (ไม่ซ้ำ)"
          value={formatNumber(getUniqueMemberCount(rows))}
          delta={buildDelta(getUniqueMemberCount(rows), prevTotals?.members)}
        />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SalesLineChart data={dailySales} />
        </div>
        <div className="lg:col-span-4">
          <BranchBarChart data={branchSales} onBranchClick={onBranchClick} />
        </div>
      </div>
    </div>
  )
}

export default OverviewPage
