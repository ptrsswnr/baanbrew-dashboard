import { formatCurrency, formatNumber } from '../lib/metrics'

function TopCustomersTable({ data }) {
  return (
    <div className="rounded-lg bg-bg-surface p-4 shadow-card sm:p-6">
      <h2 className="mb-4 text-lg leading-7 font-bold text-ink">ลูกค้าที่ซื้อมากที่สุด 10 อันดับ</h2>
      <div className="-mx-4 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="bg-bg-page text-left text-xs text-ink-muted">
              <th scope="col" className="py-2 pr-3 pl-4 font-medium sm:pl-0">#</th>
              <th scope="col" className="py-2 pr-3 font-medium">ลูกค้า</th>
              <th scope="col" className="py-2 pr-3 font-medium">สาขาประจำ</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">จำนวนบิล</th>
              <th scope="col" className="py-2 pr-4 text-right font-medium sm:pr-0">ยอดซื้อรวม</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c, i) => (
              <tr key={c.customerId} className="border-b border-border/60 last:border-0">
                <td className="py-2.5 pr-3 pl-4 tabular-nums text-ink-muted sm:pl-0">{i + 1}</td>
                <td className="py-2.5 pr-3">
                  <span className="block text-ink">{c.nickname}</span>
                  <span className="block text-xs text-ink-muted">{c.customerId}</span>
                </td>
                <td className="py-2.5 pr-3 text-ink-muted">{c.homeBranch}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums text-ink-muted">{formatNumber(c.orderCount)}</td>
                <td className="py-2.5 pr-4 text-right font-semibold tabular-nums text-ink sm:pr-0">
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
