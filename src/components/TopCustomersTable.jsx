import { formatCurrency, formatNumber } from '../lib/metrics'

function TopCustomersTable({ data }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-base font-semibold text-slate-800">ลูกค้าที่ซื้อมากที่สุด 10 อันดับ</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="py-2 pr-3 font-medium">#</th>
              <th className="py-2 pr-3 font-medium">ลูกค้า</th>
              <th className="py-2 pr-3 font-medium">สาขาประจำ</th>
              <th className="py-2 pr-3 text-right font-medium">จำนวนบิล</th>
              <th className="py-2 pr-3 text-right font-medium">ยอดซื้อรวม</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c, i) => (
              <tr key={c.customerId} className="border-b border-slate-100 last:border-0">
                <td className="py-2.5 pr-3 text-slate-500">{i + 1}</td>
                <td className="py-2.5 pr-3">
                  <span className="block text-slate-800">{c.nickname}</span>
                  <span className="block text-xs text-slate-400">{c.customerId}</span>
                </td>
                <td className="py-2.5 pr-3 text-slate-600">{c.homeBranch}</td>
                <td className="py-2.5 pr-3 text-right text-slate-600">{formatNumber(c.orderCount)}</td>
                <td className="py-2.5 pr-3 text-right font-medium text-slate-800">
                  {formatCurrency(c.spend)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TopCustomersTable
