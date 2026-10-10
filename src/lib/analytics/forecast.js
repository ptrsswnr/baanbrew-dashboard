// Lab 4.4 · ใช้ Claude Code เขียนฟังก์ชันที่ยังว่าง (Prompt 4.4A ใน PROMPTS_LAB4.md) จนกว่า npm test จะผ่าน · ห้ามแก้ไฟล์ test
// Lab 4.4 · พยากรณ์ยอดขายแบบอธิบายได้ และวัดความแม่นด้วยการย้อนทดสอบ (backtest)
import { addDays } from "../../lab3/time.js";

const dow = (ymd) => new Date(ymd + "T00:00:00Z").getUTCDay(); // 0 = อาทิตย์

/** ค่าเฉลี่ยยอดขายวันเดียวกันของสัปดาห์ K ครั้งล่าสุด (ฤดูกาลรายสัปดาห์) */
export function seasonalForecast(series, horizon, K = 8) {
  const last = series[series.length - 1].date;
  // K สัปดาห์ล่าสุด = K×7 วัน ซึ่งมีแต่ละวันในสัปดาห์พอดี K ค่า
  const recent = series.slice(-K * 7);
  return Array.from({ length: horizon }, (_, i) => {
    const date = addDays(last, i + 1);
    const same = recent.filter((s) => dow(s.date) === dow(date));
    const forecast = same.length ? same.reduce((a, s) => a + s.revenue, 0) / same.length : 0;
    return { date, forecast };
  });
}

/** ค่าเฉลี่ย K วันล่าสุด เส้นตรง (ตัวเปรียบเทียบที่ไม่สนวันในสัปดาห์) */
export function flatForecast(series, horizon, K = 28) {
  const recent = series.slice(-K);
  const avg = recent.reduce((a, s) => a + s.revenue, 0) / recent.length;
  const last = series[series.length - 1].date;
  return Array.from({ length: horizon }, (_, i) => ({ date: addDays(last, i + 1), forecast: avg }));
}

/** Mean Absolute Percentage Error (%) · ข้ามวันที่ยอดจริงเป็น 0 เพราะหารไม่ได้ */
export function mape(actual, forecast) {
  let sum = 0;
  let n = 0;
  actual.forEach((a, i) => {
    if (a === 0) return;
    sum += Math.abs(a - forecast[i]) / Math.abs(a);
    n++;
  });
  return n ? (sum / n) * 100 : 0;
}

/**
 * ย้อนทดสอบ: ซ่อน horizon วันสุดท้าย พยากรณ์จากข้อมูลก่อนหน้า แล้วเทียบกับของจริง
 * band = ±1.28 × ส่วนเบี่ยงเบนมาตรฐานของ % ความคลาดเคลื่อน (ช่วงประมาณ 80%)
 */
export function backtest(series, horizon = 28, K = 8) {
  const train = series.slice(0, -horizon);
  const actual = series.slice(-horizon);
  if (!train.length) return { test: [], mapeSeasonal: 0, mapeFlat: 0, band: 0 };

  const seasonal = seasonalForecast(train, horizon, K);
  const flat = flatForecast(train, horizon);
  const test = actual.map((a, i) => ({
    date: a.date, actual: a.revenue, seasonal: seasonal[i].forecast, flat: flat[i].forecast,
  }));

  // band เป็นสัดส่วน (เช่น 0.3 = ±30%) จาก % ความคลาดเคลื่อนแบบมีเครื่องหมาย ของวันที่ยอดจริงไม่เป็น 0
  const errs = test.filter((t) => t.actual !== 0).map((t) => (t.actual - t.seasonal) / t.actual);
  const mean = errs.reduce((a, e) => a + e, 0) / (errs.length || 1);
  const sd = Math.sqrt(errs.reduce((a, e) => a + (e - mean) ** 2, 0) / (errs.length || 1));

  return {
    test,
    mapeSeasonal: mape(test.map((t) => t.actual), test.map((t) => t.seasonal)),
    mapeFlat: mape(test.map((t) => t.actual), test.map((t) => t.flat)),
    band: 1.28 * sd,
  };
}
