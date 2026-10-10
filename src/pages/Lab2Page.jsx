import * as Bad from '../lab2/BadCharts'
import * as Fixed from '../lab2/FixedCharts'

// โจทย์ของแต่ละกราฟ: คำถามทางธุรกิจที่กราฟต้องตอบ + คำถามนำให้วิจารณ์
const CASES = [
  {
    n: 1,
    title: 'สัดส่วนยอดขายแต่ละเมนู',
    ask: 'ผู้จัดการฝ่ายเมนูถาม: เมนูไหนทำเงินมากที่สุด ควรโปรโมตตัวไหน',
    probe: ['บอกได้ไหมว่าเมนูอันดับ 3 คืออะไร', 'สีใช้แยกอะไร จำได้ไหมว่าสีไหนคือเมนูไหน'],
  },
  {
    n: 2,
    title: 'ยอดขายแยกสาขา',
    ask: 'เจ้าของร้านถาม: สาขาต่าง ๆ ขายได้ต่างกันมากแค่ไหน',
    probe: ['ดูด้วยตา สาขาที่ขายดีที่สุดขายได้กี่เท่าของสาขาที่ขายน้อยที่สุด', 'ลองเทียบกับตัวเลขจริงใน Tooltip'],
  },
  {
    n: 3,
    title: 'ยอดขายรายวัน',
    ask: 'เจ้าของร้านถาม: ยอดขายโดยรวมโตขึ้นหรือลดลง',
    probe: ['เห็นแนวโน้มชัดไหม หรือเห็นแต่ความยุ่ง', 'อ่านวันที่บนแกนได้ไหม'],
  },
  {
    n: 4,
    title: 'ยอดขายรายเดือน',
    ask: 'ผู้บริหารถาม: ทำไมเดือนล่าสุดยอดตก ต้องทำโปรฯ ด่วนไหม',
    probe: ['เดือนล่าสุดมีข้อมูลครบทุกวันหรือยัง', 'ถ้าเดือนนี้ขายครบทั้งเดือนจะได้ประมาณเท่าไร'],
  },
  {
    n: 5,
    title: 'ผลงานแต่ละสาขา',
    ask: 'ฝ่ายบริหารถาม: สาขาไหนทำผลงานได้ดีที่สุดจริง ๆ',
    probe: ['ทุกสาขาเปิดขายมานานเท่ากันไหม', 'การเทียบด้วยยอดรวมยุติธรรมกับสาขาที่เพิ่งเปิดไหม'],
  },
]

function Placeholder({ n }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center text-ink-muted">
      <div className="text-lg font-medium">ยังไม่ได้ซ่อม</div>
      <div className="mt-1 text-sm">
        สร้าง <code className="rounded bg-bg-page px-1">FixedChart{n}</code> ใน{' '}
        <code className="rounded bg-bg-page px-1">src/lab2/FixedCharts.jsx</code>
      </div>
    </div>
  )
}

function Lab2Page({ rows, products }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-bg-surface p-5 shadow-card">
        <h2 className="text-xl font-bold text-ink">Lab 2.2 · ซ่อมกราฟแย่</h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-muted">
          กราฟซ้ายมือทุกอันใช้ข้อมูลถูกต้อง แต่ทำให้คนดูเข้าใจผิดหรืออ่านไม่ออก เทียบกับกราฟขวามือที่ตอบคำถามทางธุรกิจได้ชัดเจนกว่า
        </p>
      </div>

      {CASES.map((c) => {
        const BadChart = Bad[`BadChart${c.n}`]
        const FixedChart = Fixed[`FixedChart${c.n}`]
        return (
          <section key={c.n} className="rounded-lg bg-bg-surface p-5 shadow-card">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="rounded-full bg-ink px-3 py-0.5 text-sm font-semibold text-on-ink">กราฟ {c.n}</span>
              <h3 className="text-lg font-semibold text-ink">{c.title}</h3>
            </div>
            <p className="mt-2 font-medium text-ink">{c.ask}</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-ink-muted">
              {c.probe.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <div>
                <div className="mb-1 text-sm font-semibold text-negative">ก่อนซ่อม</div>
                <div className="h-80 overflow-hidden rounded-lg bg-bg-page p-2">
                  <BadChart rows={rows} products={products} />
                </div>
              </div>
              <div>
                <div className="mb-1 text-sm font-semibold text-positive">หลังซ่อม</div>
                <div className="h-80 overflow-hidden rounded-lg bg-bg-page p-2">
                  {FixedChart ? <FixedChart rows={rows} products={products} /> : <Placeholder n={c.n} />}
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default Lab2Page
