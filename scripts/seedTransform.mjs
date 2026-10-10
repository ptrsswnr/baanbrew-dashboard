// Lab 3.1 · แปลงแถวจาก sales.csv (ผลลัพธ์ Lab 2.1) เป็นเอกสาร Firestore
// ใช้ AI เขียนฟังก์ชันในไฟล์นี้ (Prompt 3.1 ใน PROMPTS_LAB3.md) จนกว่า npm test จะผ่านทุกข้อ
// scripts/seed.mjs เรียกใช้ฟังก์ชันเหล่านี้ ไม่ต้องแก้ seed.mjs
import { addDays, daysBetween } from "../src/lab3/time.js";

export const BRANCHES = ["สยาม", "สีลม", "อารีย์", "บางนา", "มหาวิทยาลัย"];

// วันที่ในข้อความ datetime เป็นเวลาไทยอยู่แล้ว จึงตัดสตริงเอาตรง ๆ ไม่ผ่าน Date เพื่อไม่ให้ถูกแปลงเป็น UTC
const ISO_TH = /^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\+07:00$/;
const dateOf = (iso) => iso.slice(0, 10);

/**
 * เลือกเฉพาะ N วันล่าสุดของข้อมูล นับจากวันล่าสุดในไฟล์ (ไม่ใช่วันนี้) รวมวันสุดท้ายด้วย
 * @returns {{ rows: object[], start: string, end: string }}  start/end เป็น YYYY-MM-DD
 */
export function selectLastDays(rows, days) {
  if (rows.length === 0) return { rows: [], start: "", end: "" };
  // YYYY-MM-DD เรียงตามตัวอักษรได้ตรงกับเรียงตามวันที่
  let end = dateOf(rows[0].datetime);
  for (const r of rows) {
    const d = dateOf(r.datetime);
    if (d > end) end = d;
  }
  const start = addDays(end, -(days - 1));
  return { rows: rows.filter((r) => dateOf(r.datetime) >= start), start, end };
}

/** จำนวนวันที่ต้องเลื่อน ให้วันล่าสุดของข้อมูลกลายเป็น "เมื่อวาน" ของ today · ห้ามติดลบ */
export function computeShift(lastDataDate, today) {
  return Math.max(0, daysBetween(lastDataDate, today) - 1);
}

/** เลื่อนวันที่ใน datetime ("2026-09-20T16:05:09+07:00") ไป days วัน โดยคงเวลาและ +07:00 */
export function shiftDateTime(iso, days) {
  return addDays(dateOf(iso), days) + iso.slice(10);
}

/**
 * แปลง 1 แถว CSV (ทุกค่าเป็นข้อความ) เป็น { id, data }
 * id = order_id + "-" + product_id
 * data มีฟิลด์: order_id, datetime, date, hour, branch, product_id, qty, unit_price, revenue,
 *               customer_id (ว่าง = null), payment_method, channel, source = "import"
 * ต้อง throw Error ถ้าข้อมูลยังไม่สะอาด: qty ไม่ใช่จำนวนเต็มบวก, ราคาไม่ใช่ตัวเลขบวก,
 * สาขาไม่อยู่ใน BRANCHES, datetime ไม่ใช่ 20YY-MM-DDTHH:MM:SS+07:00
 */
export function toSaleDoc(row, shiftDays = 0) {
  const where = `${row.order_id}-${row.product_id}`;
  const qtyText = String(row.qty ?? "").trim();
  const priceText = String(row.unit_price ?? "").trim();
  const qty = Number(qtyText);
  const unit_price = Number(priceText);

  if (!/^\d+$/.test(qtyText) || qty < 1) throw new Error(`${where}: qty ต้องเป็นจำนวนเต็มบวก ได้ "${row.qty}"`);
  if (priceText === "" || !Number.isFinite(unit_price) || unit_price <= 0) throw new Error(`${where}: unit_price ต้องเป็นตัวเลขบวก ได้ "${row.unit_price}"`);
  if (!BRANCHES.includes(row.branch)) throw new Error(`${where}: ไม่รู้จักสาขา "${row.branch}"`);
  if (!ISO_TH.test(row.datetime ?? "")) throw new Error(`${where}: datetime ต้องเป็น 20YY-MM-DDTHH:MM:SS+07:00 ได้ "${row.datetime}"`);

  const datetime = shiftDays ? shiftDateTime(row.datetime, shiftDays) : row.datetime;
  const customer = String(row.customer_id ?? "").trim();
  return {
    id: where,
    data: {
      order_id: row.order_id,
      datetime,
      date: dateOf(datetime),
      hour: Number(datetime.slice(11, 13)),
      branch: row.branch,
      product_id: row.product_id,
      qty,
      unit_price,
      revenue: qty * unit_price,
      customer_id: customer === "" ? null : customer,
      payment_method: row.payment_method,
      channel: row.channel,
      source: "import",
    },
  };
}

/** สรุป: { docs, bills (นับ order_id ไม่ซ้ำ), revenue, byBranch: {สาขา: ยอด}, start, end } */
export function summarize(docs) {
  const bills = new Set();
  const byBranch = {};
  let revenue = 0;
  let start = "";
  let end = "";
  for (const { data } of docs) {
    bills.add(data.order_id);
    revenue += data.revenue;
    byBranch[data.branch] = (byBranch[data.branch] ?? 0) + data.revenue;
    if (!start || data.date < start) start = data.date;
    if (!end || data.date > end) end = data.date;
  }
  return { docs: docs.length, bills: bills.size, revenue, byBranch, start, end };
}
