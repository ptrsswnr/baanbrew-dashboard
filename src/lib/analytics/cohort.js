// Lab 4.2 · ใช้ Claude Code เขียนฟังก์ชันที่ยังว่าง (Prompt 4.2A ใน PROMPTS_LAB4.md) จนกว่า npm test จะผ่าน · ห้ามแก้ไฟล์ test
// Lab 4.2 · Cohort retention รายเดือน
// cohort = เดือนแรกที่ลูกค้าสมาชิกซื้อ · retention[k] = สัดส่วนลูกค้าใน cohort ที่กลับมาซื้อในเดือนที่ k (k=0 คือเดือนแรก = 100%)

/** จำนวนเดือนจาก a ถึง b เช่น monthIndex("2025-11", "2026-02") = 3 */
export function monthIndex(a, b) {
  const n = (ym) => { const [y, m] = ym.split("-").map(Number); return y * 12 + (m - 1); };
  return n(b) - n(a);
}

/**
 * @param rows  แถวยอดขาย (ไม่นับ customer_id ว่าง)
 * @param asOf  วันสุดท้ายของข้อมูล YYYY-MM-DD ใช้บอกว่าเดือนสุดท้ายข้อมูลไม่ครบหรือไม่
 * @returns {{ cohorts: {cohort, size, retention: number[]}[], lastMonth, lastMonthPartial, daysInLastMonth }}
 *   retention ยาวเท่าจำนวนเดือนที่สังเกตได้ของ cohort นั้น (ถึง lastMonth)
 */
export function computeCohorts(rows, asOf) {
  const lastMonth = asOf.slice(0, 7);
  const daysInLastMonth = Number(asOf.slice(8, 10));
  const [ly, lm] = lastMonth.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(ly, lm, 0)).getUTCDate(); // จำนวนวันเต็มของเดือนสุดท้าย (หน้าเว็บใช้แสดง "4 จาก 31 วัน")
  const lastMonthPartial = daysInLastMonth < daysInMonth;

  // เดือนที่แต่ละลูกค้าซื้อ (เซต จึงนับซ้ำในเดือนเดียวกันครั้งเดียว)
  const monthsOf = new Map();
  for (const x of rows) {
    if (!x.customer_id) continue;
    const set = monthsOf.get(x.customer_id) ?? new Set();
    set.add(x.date.slice(0, 7));
    monthsOf.set(x.customer_id, set);
  }

  // จัดลูกค้าเข้า cohort ตามเดือนแรกที่ซื้อ
  const groups = new Map();
  for (const months of monthsOf.values()) {
    const first = [...months].sort()[0];
    const g = groups.get(first) ?? [];
    g.push(months);
    groups.set(first, g);
  }

  const cohorts = [...groups.keys()].sort().map((cohort) => {
    const members = groups.get(cohort);
    const span = monthIndex(cohort, lastMonth) + 1; // จำนวนเดือนที่สังเกตได้
    const retention = Array.from({ length: span }, (_, k) => {
      const [y, m] = cohort.split("-").map(Number);
      const t = y * 12 + (m - 1) + k;
      const ym = `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
      return members.filter((months) => months.has(ym)).length / members.length;
    });
    return { cohort, size: members.length, retention };
  });

  return { cohorts, lastMonth, lastMonthPartial, daysInLastMonth, daysInMonth };
}
