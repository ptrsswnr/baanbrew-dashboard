import { useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, LabelList, Cell,
} from "recharts";
import { branchColor } from "../lib/theme.js";
import KpiCard from "./PackKpiCard.jsx";
import {
  computeKpis, dailyRevenue, withMovingAverage, revenueByBranch,
  fmtBaht, fmtBaht2, fmtNum, fmtShortBaht,
} from "../lib/metrics.js";

export const COFFEE = "var(--color-brand-strong)"; // เส้นแนวโน้ม ใช้สีหลักของธีม
export const LEAF = "var(--color-brand)";

export const thaiDate = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });

export default function Overview({ rows }) {
  const kpis = useMemo(() => computeKpis(rows), [rows]);
  const daily = useMemo(() => withMovingAverage(dailyRevenue(rows)), [rows]);
  const branches = useMemo(() => revenueByBranch(rows), [rows]);

  const first = daily[0].date, last = daily[daily.length - 1].date;

  return (
    <div>
        <header className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-ink)" }}>บ้านบรู · ภาพรวมยอดขาย</h1>
          <p className="text-ink-muted">
            {thaiDate(first)} – {thaiDate(last)} · {fmtNum(rows.length)} รายการ จาก 5 สาขา
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="ยอดขายรวม" value={fmtBaht(kpis.revenue)} />
          <KpiCard label="จำนวนบิล" value={fmtNum(kpis.bills)} />
          <KpiCard label="ยอดเฉลี่ยต่อบิล" value={fmtBaht2(kpis.avgPerBill)} />
          <KpiCard label="ลูกค้าสมาชิก" value={fmtNum(kpis.customers)} note="ไม่นับลูกค้า walk-in" />
        </section>

        <section className="mt-6 rounded-lg bg-bg-surface p-5 shadow-card">
          <h2 className="text-lg font-semibold">ยอดขายรายวัน</h2>
          <p className="mb-3 text-sm text-ink-muted">เส้นจาง = ยอดจริงรายวัน · เส้นเข้ม = ค่าเฉลี่ย 7 วัน</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="#e8eaf3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={thaiDate} minTickGap={40} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={fmtShortBaht} width={60} tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={thaiDate}
                  formatter={(v, name) => [fmtBaht(v), name === "ma" ? "เฉลี่ย 7 วัน" : "ยอดขาย"]}
                />
                <Line dataKey="revenue" stroke={COFFEE} strokeOpacity={0.25} dot={false} strokeWidth={1} />
                <Line dataKey="ma" stroke={COFFEE} dot={false} strokeWidth={2.5} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-6 rounded-lg bg-bg-surface p-5 shadow-card">
          <h2 className="text-lg font-semibold">ยอดขายแยกสาขา</h2>
          <p className="mb-3 text-sm text-ink-muted">สาขาอารีย์เพิ่งเปิดเมื่อ 1 พ.ย. 68 ยอดรวมจึงน้อยกว่าสาขาอื่น</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branches} layout="vertical" margin={{ top: 5, right: 80, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="#e8eaf3" horizontal={false} />
                <XAxis type="number" tickFormatter={fmtShortBaht} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="branch" width={90} tick={{ fontSize: 14 }} />
                <Tooltip formatter={(v) => [fmtBaht(v), "ยอดขาย"]} />
                <Bar dataKey="revenue" fill={LEAF} radius={[0, 4, 4, 0]}>
                  {/* สีประจำสาขาตามธีม คงที่ทุกที่ที่แสดงสาขา */}
                  {branches.map((b) => <Cell key={b.branch} fill={branchColor(b.branch)} />)}
                  <LabelList dataKey="revenue" position="right" formatter={fmtBaht} style={{ fontSize: 12, fill: "var(--color-ink)" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
    </div>
  );
}
