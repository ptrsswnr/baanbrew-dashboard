import { describe, it, expect } from "vitest";
import { weekStart, aggregateWeekly } from "./weekly.js";
import { addDays } from "../../lab3/time.js";

describe("weekStart", () => {
  it("คืนวันจันทร์ของสัปดาห์ (จันทร์ถึงอาทิตย์เป็นสัปดาห์เดียวกัน)", () => {
    expect(weekStart("2026-01-05")).toBe("2026-01-05"); // จันทร์
    expect(weekStart("2026-01-11")).toBe("2026-01-05"); // อาทิตย์
    expect(weekStart("2026-01-12")).toBe("2026-01-12"); // จันทร์ถัดไป
  });
  it("ข้ามเดือนและข้ามปีได้", () => {
    expect(weekStart("2026-01-01")).toBe("2025-12-29"); // พฤหัส
  });
});

describe("aggregateWeekly", () => {
  // 10 วันตั้งแต่จันทร์ 5 ม.ค. 2026: สัปดาห์แรกครบ 7 วัน สัปดาห์ถัดไปมี 3 วัน
  const points = Array.from({ length: 10 }, (_, i) => ({ date: addDays("2026-01-05", i), a: 100, b: i }));
  const weeks = aggregateWeekly(points, ["a", "b"]);
  it("รวมค่าและนับวันต่อสัปดาห์", () => {
    expect(weeks.map((w) => [w.week, w.days, w.a, w.b])).toEqual([["2026-01-05", 7, 700, 21], ["2026-01-12", 3, 300, 24]]);
  });
  it("บอกว่าสัปดาห์ไหนครบ 7 วัน", () => {
    expect(weeks.map((w) => w.complete)).toEqual([true, false]);
  });
});
