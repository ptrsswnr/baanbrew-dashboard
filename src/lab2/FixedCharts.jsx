// Lab 2.2 · ตัวอย่างเฉลย
// หลักที่ใช้ทุกกราฟ: เริ่มจากคำถาม → เลือกตัวชี้วัดที่ยุติธรรม → กราฟที่อ่านง่ายที่สุด → เขียนข้อสรุปไว้บนกราฟ
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, LabelList, Cell,
} from 'recharts'
import { revenueByProduct, monthlyRevenue, branchPerformance, weeklyRevenue, daysInMonth, thaiMonth } from './lab2Metrics'
import { formatCurrency, formatShortCurrency } from '../lib/metrics'

const MAIN = '#0369a1'
const MUTED = '#bae6fd'
const INK = '#334155'

function Frame({ takeaway, note, children }) {
  return (
    <div className="flex h-full flex-col">
      <p className="text-sm font-semibold text-slate-800">{takeaway}</p>
      <div className="min-h-0 flex-1">{children}</div>
      {note && <p className="text-xs text-slate-500">{note}</p>}
    </div>
  )
}

/** 1) Pie หลายสิบชิ้น → แท่งแนวนอน 10 อันดับแรก สีเดียว มีป้ายตัวเลข */
export function FixedChart1({ rows, products }) {
  const all = revenueByProduct(rows, products)
  const top = all.slice(0, 10)
  const restShare = all.slice(10).reduce((sum, d) => sum + d.share, 0)
  return (
    <Frame
      takeaway={`${top[0].name} ทำเงินสูงสุด (${(top[0].share * 100).toFixed(1)}% ของยอดขาย)`}
      note={`อีก ${all.length - 10} เมนูรวมกัน ${(restShare * 100).toFixed(0)}% ของยอดขาย`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" margin={{ top: 4, right: 70, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} interval={0} />
          <Tooltip formatter={(value) => [formatCurrency(value), 'ยอดขาย']} />
          <Bar dataKey="revenue" fill={MAIN} radius={[0, 3, 3, 0]} isAnimationActive={false}>
            <LabelList dataKey="share" position="right" formatter={(v) => `${(v * 100).toFixed(1)}%`} style={{ fontSize: 11, fill: INK }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Frame>
  )
}

/** 2) แกนตัด + สีรุ้ง → แกนเริ่มที่ 0 สีเดียว เรียงมากไปน้อย */
export function FixedChart2({ rows }) {
  const data = branchPerformance(rows).sort((a, b) => b.revenue - a.revenue)
  const ratio = data[0].revenue / data[data.length - 1].revenue
  return (
    <Frame takeaway={`${data[0].branch} ขายได้ ${ratio.toFixed(1)} เท่าของ${data[data.length - 1].branch} (ยอดรวมทั้งช่วงข้อมูล)`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="branch" tick={{ fontSize: 13 }} />
          <YAxis tickFormatter={formatShortCurrency} width={60} domain={[0, 'auto']} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [formatCurrency(value), 'ยอดขาย']} />
          <Bar dataKey="revenue" fill={MAIN} radius={[3, 3, 0, 0]} isAnimationActive={false}>
            <LabelList dataKey="revenue" position="top" formatter={formatShortCurrency} style={{ fontSize: 12, fill: INK }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Frame>
  )
}

/** 3) จุดยุ่งเหยิงรายวัน → รวมเป็นรายสัปดาห์ เส้นบาง แกนเป็นเดือนภาษาไทย */
export function FixedChart3({ rows }) {
  const data = weeklyRevenue(rows)
  const firstQ = data.slice(0, 13).reduce((sum, d) => sum + d.revenue, 0) / 13
  const lastQ = data.slice(-13).reduce((sum, d) => sum + d.revenue, 0) / 13
  const growth = (lastQ / firstQ - 1) * 100
  const monthTick = (week) => thaiMonth(week.slice(0, 7))
  return (
    <Frame
      takeaway={`ยอดขายต่อสัปดาห์ช่วง 3 เดือนล่าสุดสูงกว่า 3 เดือนแรก ${growth.toFixed(0)}%`}
      note="รวมเป็นรายสัปดาห์ (จันทร์–อาทิตย์) ตัดสัปดาห์แรกที่ข้อมูลไม่ครบ 7 วันออก"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="week" tickFormatter={monthTick} minTickGap={50} tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatShortCurrency} width={60} domain={[0, 'auto']} tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(week) => `สัปดาห์เริ่ม ${new Date(week + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}`}
            formatter={(value) => [formatCurrency(value), 'ยอดขายทั้งสัปดาห์']}
          />
          <Line dataKey="revenue" stroke={MAIN} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </Frame>
  )
}

/** 4) เดือนไม่ครบถูกตีความว่ายอดตก → ใช้ยอดเฉลี่ยต่อวัน และระบุเดือนที่ไม่ครบ */
export function FixedChart4({ rows }) {
  const data = monthlyRevenue(rows).map((m) => ({ ...m, partial: m.days < daysInMonth(m.month) }))
  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const diff = (last.perDay / prev.perDay - 1) * 100
  return (
    <Frame
      takeaway={`ยอดไม่ได้ตก: ${thaiMonth(last.month)} เฉลี่ยวันละ ${formatCurrency(last.perDay)} ${diff >= 0 ? 'สูงกว่า' : 'ต่ำกว่า'}เดือนก่อน ${Math.abs(diff).toFixed(1)}%`}
      note={`${thaiMonth(last.month)} มีข้อมูล ${last.days} จาก ${daysInMonth(last.month)} วัน (แท่งสีจาง) จึงใช้ยอดเฉลี่ยต่อวันเทียบแทนยอดรวม`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" tickFormatter={thaiMonth} interval={2} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={formatShortCurrency} width={56} tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={thaiMonth}
            formatter={(value, _name, item) => [`${formatCurrency(value)} (${item.payload.days} วัน)`, 'เฉลี่ยต่อวัน']}
          />
          <Bar dataKey="perDay" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {data.map((d) => <Cell key={d.month} fill={d.partial ? MUTED : MAIN} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Frame>
  )
}

/** 5) ยอดรวมไม่ยุติธรรมกับสาขาที่เพิ่งเปิด → ยอดเฉลี่ยต่อวันที่เปิดขาย */
export function FixedChart5({ rows }) {
  const data = branchPerformance(rows).sort((a, b) => b.perDay - a.perDay)
  const lowest = data[data.length - 1]
  return (
    <Frame
      takeaway={`เมื่อเทียบยอดเฉลี่ยต่อวัน อันดับต่ำสุดคือ${lowest.branch}`}
      note="ยอดเฉลี่ยต่อวันที่มีการขาย ไม่ใช่ยอดรวม จึงเทียบสาขาที่เปิดมานานต่างกันได้เป็นธรรมกว่า"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 70, left: 0, bottom: 0 }}>
          <XAxis type="number" hide domain={[0, 'auto']} />
          <YAxis type="category" dataKey="branch" width={90} tick={{ fontSize: 13 }} />
          <Tooltip formatter={(value, _name, item) => [`${formatCurrency(value)} (${item.payload.days} วัน)`, 'เฉลี่ยต่อวัน']} />
          <Bar dataKey="perDay" fill={MAIN} radius={[0, 3, 3, 0]} isAnimationActive={false}>
            <LabelList dataKey="perDay" position="right" formatter={formatCurrency} style={{ fontSize: 12, fill: INK }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Frame>
  )
}
