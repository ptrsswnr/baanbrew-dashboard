import { LoginCard, UserChip, authErrorText } from "../lab3/AuthBar.jsx";
import { useState } from "react";

// สีตามธีมใน src/index.css (@theme): ใช้ var() เพื่อให้เปลี่ยนที่เดียวแล้วตามทั้งหน้า
export const INK = "var(--color-ink)";
export const MUTED = "#a4a6b8"; // เทาอ่อน ใช้กับชุดข้อมูลรอง/เส้นอ้างอิง
export const RAMP = ["#fde8f1", "#fbcde0", "#f6a3c6", "#ee6fa1", "#ec4d8c", "#b82a66"]; // ไล่สีชมพูเดียว อ่อน→เข้ม (brand-tint → brand)
export const MAIN = "var(--color-brand)";
export const pct = (x, d = 0) => (x * 100).toFixed(d) + "%";
export const thaiDay = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
export const thaiMonth = (ym) => new Date(ym + "-01T00:00:00").toLocaleDateString("th-TH", { month: "short", year: "2-digit" });

export function Card({ title, sub, children, right }) {
  return (
    <section className="rounded-lg bg-bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {sub && <p className="text-sm text-ink-muted">{sub}</p>}
        </div>
        {right}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** แสดงแทนส่วนที่ยังคำนวณไม่ได้ เช่น ฟังก์ชันยังเป็น "ยังไม่ได้ทำ" */
export function Pending({ lab, error }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-border p-6 text-center text-ink-muted">
      <div className="font-medium">รอ {lab}</div>
      <div className="mt-1 text-sm">{error}</div>
    </div>
  );
}

export function Insight({ children }) {
  return <p className="mt-3 rounded-lg bg-bg-page px-3 py-2 text-sm text-ink">💡 {children}</p>;
}

/** ส่วนหัวร่วม: ล็อกอิน, ความสดของข้อมูล, จำนวนเอกสารที่อ่าน */
export function AnalyticsShell({ source, state, title, children }) {
  const { user, data, error } = state;
  const [authError, setAuthError] = useState(null);
  if (user === undefined) return <p className="text-ink-muted">กำลังตรวจสอบการเข้าสู่ระบบ…</p>;
  if (!user) return <LoginCard onSignIn={() => source.signIn().catch((e) => setAuthError(authErrorText(e)))} error={authError} />;
  const m = data?.meta;
  return (
    <div>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: INK }}>{title}</h1>
          {m && (
            <p className="mt-1 text-sm text-ink-muted">
              ข้อมูลถึง {thaiDay(m.asOf)} · {m.rows?.toLocaleString()} รายการ ·{" "}
              {m.builtBy === "demo" ? <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800">โหมดสาธิต คำนวณในเบราว์เซอร์</span>
                : <>อัปเดต {m.builtAt ? new Date(m.builtAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }) : "–"} โดย {m.builtBy === "github-actions" ? "GitHub Actions" : "เครื่องผู้สอน/ผู้เรียน"} · อ่าน {data.reads} เอกสาร</>}
            </p>
          )}
        </div>
        <UserChip user={user} onSignOut={() => source.signOut()} />
      </header>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-negative">{error}</p>}
      {!data && !error && <p className="text-ink-muted">กำลังโหลดผลวิเคราะห์…</p>}
      {data && children(data)}
    </div>
  );
}
