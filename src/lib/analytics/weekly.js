// Lab 4.4B · รวมยอดรายวันเป็นรายสัปดาห์ (จันทร์–อาทิตย์) pure function ไม่เรียก Firestore
import { addDays } from "../../lab3/time.js";

/** วันจันทร์ของสัปดาห์ที่วันนั้นอยู่ (YYYY-MM-DD) · หาวันในสัปดาห์จาก UTC จึงไม่เพี้ยนตาม timezone */
export function weekStart(ymd) {
  const dow = new Date(ymd + "T00:00:00Z").getUTCDay(); // 0 = อาทิตย์
  return addDays(ymd, -((dow + 6) % 7));
}

/**
 * รวมจุดข้อมูลรายวันเป็นรายสัปดาห์
 * @param points  [{ date, ...ตัวเลข }]
 * @param fields  ชื่อฟิลด์ตัวเลขที่ต้องการรวม เช่น ["actual", "seasonal"]
 * @returns [{ week (วันจันทร์), days (จำนวนวันที่มีข้อมูล), complete (ครบ 7 วัน), ...ผลรวม }] เรียงตามสัปดาห์
 */
export function aggregateWeekly(points, fields) {
  const byWeek = new Map();
  for (const p of points) {
    const w = weekStart(p.date);
    const cur = byWeek.get(w) ?? { week: w, days: 0, ...Object.fromEntries(fields.map((f) => [f, 0])) };
    cur.days += 1;
    for (const f of fields) cur[f] += p[f];
    byWeek.set(w, cur);
  }
  return [...byWeek.values()]
    .sort((a, b) => a.week.localeCompare(b.week))
    .map((w) => ({ ...w, complete: w.days === 7 }));
}
