import KpiCard from '../components/KpiCard'
import CustomerAgeChart from '../components/CustomerAgeChart'
import CustomerGenderChart from '../components/CustomerGenderChart'
import CustomerBranchChart from '../components/CustomerBranchChart'
import NewMembersChart from '../components/NewMembersChart'
import TopCustomersTable from '../components/TopCustomersTable'
import EmptyState from '../components/EmptyState'
import {
  getCustomerCount,
  getActivePurchaserShare,
  getCustomersByAgeGroup,
  getCustomersByGender,
  getCustomersByBranch,
  getNewMembersByMonth,
  getTopCustomersBySpend,
  formatNumber,
  formatPercent,
} from '../lib/metrics'

function CustomersPage({ rows, customers }) {
  if (customers.length === 0) {
    return <EmptyState message="ไม่มีข้อมูลลูกค้าในช่วงที่เลือก ลองเปลี่ยนสาขาหรือวันที่" />
  }

  const customersByAgeGroup = getCustomersByAgeGroup(customers)
  const customersByGender = getCustomersByGender(customers)
  const customersByBranch = getCustomersByBranch(customers)
  const newMembersByMonth = getNewMembersByMonth(customers)
  const topCustomers = getTopCustomersBySpend(rows, customers)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="สมาชิกทั้งหมด" value={formatNumber(getCustomerCount(customers))} />
        <KpiCard label="สมาชิกที่เคยซื้อแล้ว" value={formatPercent(getActivePurchaserShare(customers))} />
      </div>

      <NewMembersChart data={newMembersByMonth} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CustomerAgeChart data={customersByAgeGroup} />
        <CustomerGenderChart data={customersByGender} />
      </div>

      <CustomerBranchChart data={customersByBranch} />
      <TopCustomersTable data={topCustomers} />
    </div>
  )
}

export default CustomersPage
