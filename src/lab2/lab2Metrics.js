// ฟังก์ชันคำนวณสำหรับ Lab 2.2 · ใช้ร่วมกันทั้งกราฟแย่และกราฟที่ซ่อมแล้ว
// rows มาจาก parseSalesCsv() ใน src/lib/metrics.js (มี amount, date, productId, branch แล้ว)
import { getDailySales } from '../lib/metrics'

/** ยอดขายรวมรายวัน (รูปแบบ {date, revenue} ให้ตรงกับกราฟ Lab 2.2) */
export function dailyRevenue(rows) {
  return getDailySales(rows).map(({ date, total }) => ({ date, revenue: total }))
}

/** ยอดขายต่อเมนู เรียงมากไปน้อย พร้อมสัดส่วน */
export function revenueByProduct(rows, products) {
  const nameById = Object.fromEntries((products ?? []).map((p) => [p.product_id, p.product_name]))
  const totals = new Map()
  for (const row of rows) {
    totals.set(row.productId, (totals.get(row.productId) || 0) + row.amount)
  }
  const total = Array.from(totals.values()).reduce((sum, v) => sum + v, 0)
  return Array.from(totals, ([id, revenue]) => ({
    id,
    name: nameById[id] || id,
    revenue,
    share: total === 0 ? 0 : revenue / total,
  })).sort((a, b) => b.revenue - a.revenue)
}

/** ยอดขายรายเดือน พร้อมจำนวนวันที่มีข้อมูล และยอดเฉลี่ยต่อวัน */
export function monthlyRevenue(rows) {
  const totals = new Map()
  for (const row of rows) {
    const month = row.date.slice(0, 7)
    const entry = totals.get(month) || { month, revenue: 0, days: new Set() }
    entry.revenue += row.amount
    entry.days.add(row.date)
    totals.set(month, entry)
  }
  return Array.from(totals.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({ month: m.month, revenue: m.revenue, days: m.days.size, perDay: m.revenue / m.days.size }))
}

/** จำนวนวันในเดือนตามปฏิทิน ใช้ตรวจว่าเดือนไหนข้อมูลไม่ครบ */
export function daysInMonth(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month, 0).getDate()
}

/** ยอดขายต่อสาขา: ยอดรวม, จำนวนวันที่เปิดขาย, ยอดเฉลี่ยต่อวัน */
export function branchPerformance(rows) {
  const totals = new Map()
  for (const row of rows) {
    const entry = totals.get(row.branch) || { branch: row.branch, revenue: 0, days: new Set() }
    entry.revenue += row.amount
    entry.days.add(row.date)
    totals.set(row.branch, entry)
  }
  return Array.from(totals.values()).map((b) => ({
    branch: b.branch,
    revenue: b.revenue,
    days: b.days.size,
    perDay: b.revenue / b.days.size,
  }))
}

/** ยอดขายรายสัปดาห์ (เริ่มวันจันทร์) ตัดสัปดาห์ที่มีข้อมูลไม่ครบ 7 วันออก */
export function weeklyRevenue(rows) {
  const totals = new Map()
  for (const row of rows) {
    const date = new Date(row.date + 'T00:00:00')
    const monday = new Date(date)
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))
    const key = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
    const entry = totals.get(key) || { week: key, revenue: 0, days: new Set() }
    entry.revenue += row.amount
    entry.days.add(row.date)
    totals.set(key, entry)
  }
  return Array.from(totals.values())
    .filter((w) => w.days.size === 7)
    .sort((a, b) => a.week.localeCompare(b.week))
    .map((w) => ({ week: w.week, revenue: w.revenue }))
}

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

/** แปลง YYYY-MM เป็นเดือนไทยแบบย่อ เช่น "มี.ค. 69" */
export function thaiMonth(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  return `${THAI_MONTHS_SHORT[month - 1]} ${String(year + 543).slice(-2)}`
}
