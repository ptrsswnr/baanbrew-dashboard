/** กรองแถวยอดขายตามสาขา (null = ทุกสาขา) และช่วงวันที่ (from/to ว่าง = ไม่จำกัด) */
export function filterRows(rows, branch, dateRange) {
  return rows.filter((row) => {
    if (branch && row.branch !== branch) return false
    if (dateRange.from && row.date < dateRange.from) return false
    if (dateRange.to && row.date > dateRange.to) return false
    return true
  })
}

/** กรองลูกค้าตามสาขาประจำและช่วงวันที่สมัคร ด้วยเงื่อนไขเดียวกับ filterRows */
export function filterCustomers(customers, branch, dateRange) {
  return customers.filter((customer) => {
    if (branch && customer.homeBranch !== branch) return false
    if (dateRange.from && customer.joinedDate < dateRange.from) return false
    if (dateRange.to && customer.joinedDate > dateRange.to) return false
    return true
  })
}

/** ช่วงวันที่ต่ำสุด-สูงสุดในข้อมูล ใช้กำหนด min/max ของตัวกรองวันที่ */
export function getDateBounds(rows) {
  const dates = rows.map((row) => row.date).sort()
  return { min: dates[0], max: dates[dates.length - 1] }
}
