import Papa from 'papaparse'

/**
 * แปลง CSV ดิบเป็นรายการ "รายการสินค้าในบิล" (1 แถว = 1 order_id + 1 product_id)
 * พร้อมคำนวณยอดขายต่อแถว (amount = qty * unitPrice) และดึงวันที่ไทย (YYYY-MM-DD)
 * ออกจาก datetime โดยตัดจากอักขระ 10 ตัวแรก เพราะ datetime มี +07:00 ติดมาแล้ว
 * จึงเป็นวันที่ตามเวลาไทยอยู่แล้ว ไม่ต้องแปลง timezone เพิ่ม
 */
export function parseSalesCsv(csvText) {
  const { data } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  return data.map((row) => {
    const qty = Number(row.qty)
    const unitPrice = Number(row.unit_price)
    return {
      orderId: row.order_id,
      datetime: row.datetime,
      date: row.datetime ? row.datetime.slice(0, 10) : '',
      branch: row.branch,
      productId: row.product_id,
      qty,
      unitPrice,
      amount: qty * unitPrice,
      customerId: row.customer_id ? row.customer_id.trim() : '',
      paymentMethod: row.payment_method,
      channel: row.channel,
    }
  })
}

/** ยอดขายรวม = ผลรวมของ qty * unitPrice ของทุกแถว */
export function getTotalSales(rows) {
  return rows.reduce((sum, row) => sum + row.amount, 0)
}

/** จำนวนบิล = จำนวน order_id ที่ไม่ซ้ำกัน (บิลเดียวมีได้หลายแถว/หลายสินค้า) */
export function getOrderCount(rows) {
  return new Set(rows.map((row) => row.orderId)).size
}

/** ยอดเฉลี่ยต่อบิล = ยอดขายรวม หารด้วยจำนวนบิล */
export function getAverageOrderValue(rows) {
  const orderCount = getOrderCount(rows)
  return orderCount === 0 ? 0 : getTotalSales(rows) / orderCount
}

/** จำนวนลูกค้าสมาชิกไม่ซ้ำ = นับเฉพาะแถวที่มี customer_id (ไม่ว่าง) แล้วตัดตัวซ้ำด้วย Set */
export function getUniqueMemberCount(rows) {
  const memberIds = rows.filter((row) => row.customerId).map((row) => row.customerId)
  return new Set(memberIds).size
}

/** ยอดขายรายวัน = รวม amount ตามวันที่ (date) แล้วเรียงจากวันเก่าไปใหม่ */
export function getDailySales(rows) {
  const totals = new Map()
  for (const row of rows) {
    totals.set(row.date, (totals.get(row.date) || 0) + row.amount)
  }
  return Array.from(totals, ([date, total]) => ({ date, total })).sort((a, b) =>
    a.date.localeCompare(b.date),
  )
}

/** เพิ่มค่าเฉลี่ยเคลื่อนที่ 7 วัน (avg7) ลงในข้อมูลยอดขายรายวัน โดยดูจากวันปัจจุบันย้อนหลังไม่เกิน windowSize วัน */
export function addMovingAverage(dailySales, windowSize = 7) {
  return dailySales.map((row, index) => {
    const start = Math.max(0, index - windowSize + 1)
    const window = dailySales.slice(start, index + 1)
    const avg = window.reduce((sum, item) => sum + item.total, 0) / window.length
    return { ...row, avg7: avg }
  })
}

/** ยอดขายแยกสาขา = รวม amount ตามสาขา แล้วเรียงจากมากไปน้อย */
export function getBranchSales(rows) {
  const totals = new Map()
  for (const row of rows) {
    totals.set(row.branch, (totals.get(row.branch) || 0) + row.amount)
  }
  return Array.from(totals, ([branch, total]) => ({ branch, total })).sort(
    (a, b) => b.total - a.total,
  )
}

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

/** แปลงวันที่ YYYY-MM-DD เป็นวันที่ไทยแบบย่อ เช่น "1 เม.ย. 68" (ปี พ.ศ. เอา 2 หลักท้าย) */
export function formatThaiDateShort(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const buddhistYear = year + 543
  return `${day} ${THAI_MONTHS_SHORT[month - 1]} ${String(buddhistYear).slice(-2)}`
}

/** จัดรูปแบบตัวเลขเป็นบาท พร้อมจุลภาคและหน่วย ฿ เช่น ฿1,234,567 */
export function formatCurrency(value) {
  return `฿${Math.round(value).toLocaleString('th-TH')}`
}

/** จัดรูปแบบตัวเลขทั่วไปพร้อมจุลภาค เช่น 12,345 */
export function formatNumber(value) {
  return value.toLocaleString('th-TH')
}

/** จัดรูปแบบเงินบาทแบบย่อสำหรับแกนกราฟ เช่น ฿1.2 ล. หรือ ฿850k */
export function formatShortCurrency(value) {
  if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(1)} ล.`
  if (value >= 1_000) return `฿${(value / 1_000).toFixed(0)}k`
  return `฿${Math.round(value)}`
}

/** จัดรูปแบบสัดส่วนเป็นเปอร์เซ็นต์ 1 ตำแหน่ง เช่น 0.1234 -> "12.3%" */
export function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`
}

/** แปลง customers.csv เป็นรายการโปรไฟล์ลูกค้า (1 แถว = 1 คน) */
export function parseCustomersCsv(csvText) {
  const { data } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  return data.map((row) => ({
    customerId: row.customer_id,
    nickname: row.nickname,
    gender: row.gender,
    ageGroup: row.age_group,
    homeBranch: row.home_branch,
    joinedDate: row.joined_date,
    hasPurchase: row.has_purchase === 'True',
  }))
}

/** จำนวนสมาชิกทั้งหมด */
export function getCustomerCount(customers) {
  return customers.length
}

/** สัดส่วนสมาชิกที่เคยซื้อแล้วอย่างน้อย 1 ครั้ง (has_purchase = True) */
export function getActivePurchaserShare(customers) {
  if (customers.length === 0) return 0
  const buyers = customers.filter((c) => c.hasPurchase).length
  return buyers / customers.length
}

/** ลำดับช่วงอายุจากน้อยไปมาก ใช้จัดเรียงกราฟช่วงอายุให้อ่านเป็นสเกลอายุ ไม่ใช่เรียงตามจำนวน */
const AGE_GROUP_ORDER = ['ต่ำกว่า 18', '18-24', '25-34', '35-44', '45-54', '55+']

/** จำนวนสมาชิกแยกตามช่วงอายุ เรียงจากอายุน้อยไปมาก */
export function getCustomersByAgeGroup(customers) {
  const counts = new Map()
  for (const c of customers) {
    counts.set(c.ageGroup, (counts.get(c.ageGroup) || 0) + 1)
  }
  return AGE_GROUP_ORDER.filter((ageGroup) => counts.has(ageGroup)).map((ageGroup) => ({
    ageGroup,
    count: counts.get(ageGroup),
  }))
}

/** จำนวนสมาชิกแยกตามเพศ */
export function getCustomersByGender(customers) {
  const counts = new Map()
  for (const c of customers) {
    counts.set(c.gender, (counts.get(c.gender) || 0) + 1)
  }
  return Array.from(counts, ([gender, count]) => ({ gender, count }))
}

/** จำนวนสมาชิกแยกตามสาขาที่สมัคร เรียงจากมากไปน้อย */
export function getCustomersByBranch(customers) {
  const counts = new Map()
  for (const c of customers) {
    counts.set(c.homeBranch, (counts.get(c.homeBranch) || 0) + 1)
  }
  return Array.from(counts, ([branch, count]) => ({ branch, count })).sort(
    (a, b) => b.count - a.count,
  )
}

/** จำนวนสมาชิกใหม่รายเดือน (YYYY-MM) ตามวันที่สมัคร เรียงจากเดือนเก่าไปใหม่ */
export function getNewMembersByMonth(customers) {
  const counts = new Map()
  for (const c of customers) {
    const month = c.joinedDate ? c.joinedDate.slice(0, 7) : ''
    counts.set(month, (counts.get(month) || 0) + 1)
  }
  return Array.from(counts, ([month, count]) => ({ month, count })).sort((a, b) =>
    a.month.localeCompare(b.month),
  )
}

/** ลูกค้าที่ซื้อเยอะสุด topN อันดับ รวมยอดซื้อจาก sales rows เข้ากับโปรไฟล์ใน customers.csv */
export function getTopCustomersBySpend(rows, customers, topN = 10) {
  const customerById = new Map(customers.map((c) => [c.customerId, c]))
  const spendByCustomer = new Map()
  for (const row of rows) {
    if (!row.customerId) continue
    const entry = spendByCustomer.get(row.customerId) || { spend: 0, orderIds: new Set() }
    entry.spend += row.amount
    entry.orderIds.add(row.orderId)
    spendByCustomer.set(row.customerId, entry)
  }

  return Array.from(spendByCustomer, ([customerId, entry]) => ({
    customerId,
    nickname: customerById.get(customerId)?.nickname || customerId,
    homeBranch: customerById.get(customerId)?.homeBranch || '-',
    spend: entry.spend,
    orderCount: entry.orderIds.size,
  }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, topN)
}
