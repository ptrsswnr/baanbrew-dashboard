import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '../lib/metrics'

function CustomerAgeChart({ data }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-base font-semibold text-slate-800">สมาชิกแยกตามช่วงอายุ</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="ageGroup" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} width={50} />
          <Tooltip formatter={(value) => `${formatNumber(value)} คน`} />
          <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CustomerAgeChart
