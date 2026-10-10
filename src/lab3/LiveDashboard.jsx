// Lab 3.2 · Dashboard ยอดขายแบบ real-time จาก Firestore
// แปลงเอกสาร Firestore เป็นรูปแบบแถวเดียวกับ parseSalesCsv เพื่อใช้ metrics.js / กราฟเดิมได้ทันที
import { useEffect, useMemo, useRef, useState } from 'react'
import { collection, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import KpiCard from '../components/KpiCard'
import SalesLineChart from '../components/SalesLineChart'
import BranchBarChart from '../components/BranchBarChart'
import ChartTooltip from '../components/ChartTooltip'
import EmptyState from '../components/EmptyState'
import SaleForm from './SaleForm'
import { db, projectId } from './firebase.js'
import { addDays, todayBangkok } from './time.js'
import { BRANCHES } from './saleModel.js'
import {
  getTotalSales, getOrderCount, getAverageOrderValue, getUniqueMemberCount,
  getDailySales, getBranchSales, formatCurrency, formatNumber, formatShortCurrency,
} from '../lib/metrics'

const RANGES = [
  { id: 'today', label: 'วันนี้', days: 1 },
  { id: '7', label: '7 วัน', days: 7 },
  { id: '30', label: '30 วัน', days: 30 },
]

const toRow = (id, d) => ({
  id,
  orderId: d.order_id,
  datetime: d.datetime,
  date: d.date,
  hour: d.hour,
  branch: d.branch,
  productId: d.product_id,
  qty: d.qty,
  unitPrice: d.unit_price,
  amount: d.revenue,
  customerId: d.customer_id ?? '',
  paymentMethod: d.payment_method,
  channel: d.channel,
})

const ERRORS = {
  'permission-denied': 'Security Rules ไม่อนุญาตให้อ่านข้อมูล',
  unavailable: 'เชื่อมต่อ Firestore ไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่',
  'resource-exhausted': 'โควตา Firestore ของวันนี้หมดแล้ว รอรีเซ็ตหรือเลือกช่วงวันที่สั้นลง',
  'failed-precondition': 'query นี้ต้องมี index ใน Firestore',
}
const errorText = (e) => ERRORS[e.code] ?? e.message

function HourlyChart({ rows }) {
  const data = Array.from({ length: 24 }, (_, hour) => ({ hour, total: 0 }))
  for (const r of rows) data[r.hour].total += r.amount
  return (
    <div className="h-full rounded-lg bg-bg-surface p-4 shadow-card sm:p-6">
      <h2 className="mb-4 text-lg leading-7 font-bold text-ink">ยอดขายรายชั่วโมง (วันนี้)</h2>
      <div className="h-[220px] sm:h-[320px] lg:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} interval={2} tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
            <YAxis tickFormatter={formatShortCurrency} width={56} tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip labelFormatter={(h) => `${h}:00 น.`} valueFormatter={(v) => formatCurrency(v)} />} cursor={{ fill: 'var(--color-brand-tint)' }} />
            <Bar dataKey="total" name="ยอดขาย" fill="#ec4d8c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function LiveDashboard({ user }) {
  const [rangeId, setRangeId] = useState('7')
  const [branch, setBranch] = useState(null)
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  const [reads, setReads] = useState(0)
  const [fresh, setFresh] = useState(() => new Set())
  const [products, setProducts] = useState(null)
  const timers = useRef([])

  useEffect(() => {
    getDocs(collection(db, 'products'))
      .then((snap) => setProducts(snap.docs.map((d) => d.data()).sort((a, b) => a.product_id.localeCompare(b.product_id))))
      .catch((e) => setError(errorText(e)))
  }, [])

  const range = RANGES.find((r) => r.id === rangeId)

  useEffect(() => {
    const end = todayBangkok()
    const start = addDays(end, -(range.days - 1))
    setRows(null)
    setError(null)
    let isFirst = true
    const q = query(collection(db, 'sales'), where('date', '>=', start), where('date', '<=', end), orderBy('date'))
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setReads((n) => n + snap.docChanges().length)
        // snapshot แรกคือข้อมูลเดิมทั้งหมด ไฮไลต์เฉพาะเอกสารที่เข้ามาหลังจากนั้น
        const added = isFirst ? [] : snap.docChanges().filter((c) => c.type === 'added').map((c) => c.doc.id)
        isFirst = false
        setRows(snap.docs.map((d) => toRow(d.id, d.data())))
        if (added.length) {
          setFresh((s) => new Set([...s, ...added]))
          timers.current.push(setTimeout(() => setFresh((s) => new Set([...s].filter((id) => !added.includes(id)))), 4000))
        }
      },
      (e) => setError(errorText(e)),
    )
    return () => {
      unsubscribe()
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [range.days])

  const filtered = useMemo(() => (rows && branch ? rows.filter((r) => r.branch === branch) : rows), [rows, branch])
  const latest = useMemo(
    () => (filtered ? [...filtered].sort((a, b) => b.datetime.localeCompare(a.datetime)).slice(0, 8) : []),
    [filtered],
  )

  return (
    <div className="grid gap-4 sm:gap-6 xl:grid-cols-12">
      <div className="min-w-0 space-y-4 sm:space-y-6 xl:col-span-8">
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-bg-surface p-4 shadow-card">
          <div role="group" aria-label="ช่วงเวลา" className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={r.id === rangeId}
                onClick={() => setRangeId(r.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${r.id === rangeId ? 'bg-brand-strong text-white' : 'bg-bg-page text-ink-muted hover:text-ink'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <select
            aria-label="สาขา"
            value={branch ?? ''}
            onChange={(e) => setBranch(e.target.value || null)}
            className="rounded-md border border-border bg-bg-surface px-3 py-1.5 text-sm text-ink"
          >
            <option value="">ทุกสาขา</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <p className="ml-auto text-xs text-ink-muted tabular-nums">
            {products ? `✅ ${projectId} · พบเมนู ${products.length} รายการ · ` : ''}อ่านเอกสารไปแล้ว {formatNumber(reads)}
          </p>
        </div>

        {error && <p role="alert" className="rounded-lg bg-bg-surface p-4 text-negative shadow-card">❌ {error}</p>}
        {!error && !rows && <div className="h-80 animate-pulse rounded-lg bg-border" />}
        {rows && filtered.length === 0 && !error && (
          <EmptyState message="ยังไม่มียอดขายในช่วงนี้" actionLabel={branch ? 'ดูทุกสาขา' : undefined} onAction={() => setBranch(null)} />
        )}

        {rows && filtered.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              <KpiCard tone="pink" label="ยอดขายรวม" value={formatCurrency(getTotalSales(filtered))} />
              <KpiCard tone="purple" label="จำนวนบิล" value={formatNumber(getOrderCount(filtered))} />
              <KpiCard tone="blue" label="ยอดเฉลี่ยต่อบิล" value={formatCurrency(getAverageOrderValue(filtered))} />
              <KpiCard tone="amber" label="ลูกค้าสมาชิก (ไม่ซ้ำ)" value={formatNumber(getUniqueMemberCount(filtered))} />
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                {rangeId === 'today' ? <HourlyChart rows={filtered} /> : <SalesLineChart data={getDailySales(filtered)} />}
              </div>
              <div className="lg:col-span-5">
                <BranchBarChart data={getBranchSales(rows)} onBranchClick={(b) => setBranch((cur) => (cur === b ? null : b))} />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg bg-bg-surface p-4 shadow-card sm:p-6">
              <h2 className="mb-3 text-lg leading-7 font-bold text-ink">รายการล่าสุด</h2>
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-ink-muted">
                  <tr><th className="py-2 pr-3">เวลา</th><th className="pr-3">สาขา</th><th className="pr-3">เมนู</th><th className="pr-3 text-right">จำนวน</th><th className="text-right">ยอด</th></tr>
                </thead>
                <tbody>
                  {latest.map((r) => (
                    <tr key={r.id} className={`border-t border-border tabular-nums transition-colors duration-700 ${fresh.has(r.id) ? 'bg-brand-tint' : ''}`}>
                      <td className="py-2 pr-3 whitespace-nowrap">{r.datetime.slice(5, 10)} {r.datetime.slice(11, 16)}</td>
                      <td className="pr-3">{r.branch}</td>
                      <td className="pr-3">{products?.find((p) => p.product_id === r.productId)?.product_name ?? r.productId}</td>
                      <td className="pr-3 text-right">{r.qty}</td>
                      <td className="text-right font-semibold">{formatCurrency(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="xl:col-span-4">
        <SaleForm products={products} uid={user.uid} />
      </div>
    </div>
  )
}

export default LiveDashboard
