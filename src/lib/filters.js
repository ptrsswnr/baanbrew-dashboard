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

const toDateStr = (date) => date.toISOString().slice(0, 10)
const oneDayMs = 24 * 60 * 60 * 1000

/**
 * แถวของ "ช่วงก่อนหน้าที่ยาวเท่ากัน" ต่อจาก dateRange.from ย้อนกลับไป ใช้ทำ KPI delta
 * คืนค่า null ถ้ายังไม่ได้เลือกช่วงวันที่ครบทั้ง from และ to (ไม่มี "ช่วงก่อนหน้า" ที่นิยามได้ชัดเจน)
 */
export function getPreviousPeriodRows(rows, branch, dateRange) {
  if (!dateRange.from || !dateRange.to) return null
  const from = new Date(dateRange.from + 'T00:00:00')
  const to = new Date(dateRange.to + 'T00:00:00')
  const lengthMs = to - from
  const prevTo = new Date(from.getTime() - oneDayMs)
  const prevFrom = new Date(prevTo.getTime() - lengthMs)
  return filterRows(rows, branch, { from: toDateStr(prevFrom), to: toDateStr(prevTo) })
}
