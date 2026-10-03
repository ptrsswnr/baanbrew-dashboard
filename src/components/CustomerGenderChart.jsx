import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatNumber } from '../lib/metrics'

const COLORS = ['#0ea5e9', '#f472b6', '#94a3b8']

function CustomerGenderChart({ data }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-base font-semibold text-slate-800">สมาชิกแยกตามเพศ</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="gender" innerRadius={60} outerRadius={90} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.gender} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${formatNumber(value)} คน`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CustomerGenderChart
