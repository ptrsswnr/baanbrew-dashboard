import { useEffect, useRef, useState } from 'react'

const C = 6 // ขนาดพิกเซล 1 ช่อง
const BODY_COLS = 11
const BODY_ROWS = 7
// เผื่อพื้นที่รอบตัวละคร: ซ้าย/ขวา 1 ช่อง (หูหิ้วแก้ว) และด้านบน 3 ช่อง (หมวก + ควันกาแฟ)
const PAD_X = 1
const PAD_TOP = 3
const W = (BODY_COLS + PAD_X * 2) * C
const H = (BODY_ROWS + PAD_TOP) * C
const SPEED = 45 // px/s ตอนเดิน
const GRAVITY = 1800 // px/s²
const POP_W = 232
const POP_H = 214
const STORAGE_KEY = 'baanbrew-critter'

// สีตัวน้อง: ดึงจากสีธีมของหน้าเว็บ (a→b = ไล่เฉดแนวทแยง, a=b = สีเดียว)
const COLORS = [
  { id: 'coral', label: 'ส้มเดิม', a: '#dc7455', b: '#dc7455' },
  { id: 'pink-purple', label: 'ชมพู→ม่วง', a: '#ec4d8c', b: '#8250c4' },
  { id: 'pink', label: 'ชมพู', a: '#ec4d8c', b: '#ec4d8c' },
  { id: 'purple', label: 'ม่วง', a: '#8250c4', b: '#8250c4' },
  { id: 'blue', label: 'ฟ้า', a: '#3aa9e4', b: '#3aa9e4' },
  { id: 'green', label: 'เขียว', a: '#22b573', b: '#22b573' },
  { id: 'amber', label: 'เหลืองส้ม', a: '#f5a524', b: '#e8590c' },
]

// เครื่องแต่งกาย 5 ชิ้น; slot เดียวกัน (หมวก) ใส่ได้ทีละชิ้น
const COSTUMES = [
  { id: 'beret', label: 'เบเรต์บาริสต้า', slot: 'hat' },
  { id: 'crown', label: 'มงกุฎ', slot: 'hat' },
  { id: 'shades', label: 'แว่นกันแดด', slot: 'face' },
  { id: 'bowtie', label: 'โบว์ไท', slot: 'neck' },
  { id: 'apron', label: 'ผ้ากันเปื้อน', slot: 'body' },
]

const DEFAULT_LOOK = { color: 'coral', costumes: [] }

function loadLook() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && COLORS.some((c) => c.id === saved.color) && Array.isArray(saved.costumes)) {
      return { color: saved.color, costumes: saved.costumes.filter((id) => COSTUMES.some((c) => c.id === id)) }
    }
  } catch {
    // localStorage ใช้ไม่ได้ (โหมดส่วนตัว ฯลฯ) — ใช้ค่าเริ่มต้น
  }
  return DEFAULT_LOOK
}

const rand = (min, max) => min + Math.random() * (max - min)

function Rect({ x, y, w, h, fill }) {
  return <rect x={x * C} y={y * C} width={w * C} height={h * C} fill={fill} />
}

function Legs({ cols, length, className }) {
  return (
    <g className={className}>
      {cols.map((c) => (
        <Rect key={c} x={c} y={BODY_ROWS - length} w={1} h={length} fill="url(#critterGrad)" />
      ))}
    </g>
  )
}

function Costume({ id }) {
  switch (id) {
    case 'beret':
      return (
        <g>
          <Rect x={3} y={-1} w={6} h={1} fill="#2f2f45" />
          <Rect x={2.5} y={-0.4} w={7} h={0.4} fill="#2f2f45" />
          <Rect x={5.5} y={-1.6} w={1} h={0.6} fill="#2f2f45" />
        </g>
      )
    case 'crown':
      return (
        <g fill="#f5b61f">
          <Rect x={3} y={-1} w={5} h={1} fill="#f5b61f" />
          <Rect x={3} y={-2} w={1} h={1} fill="#f5b61f" />
          <Rect x={5} y={-2} w={1} h={1} fill="#f5b61f" />
          <Rect x={7} y={-2} w={1} h={1} fill="#f5b61f" />
          <Rect x={5} y={-0.7} w={1} h={0.4} fill="#d6336f" />
        </g>
      )
    case 'shades':
      return (
        <g fill="#111">
          <Rect x={2.6} y={0.9} w={2.2} h={1.5} fill="#111" />
          <Rect x={6.2} y={0.9} w={2.2} h={1.5} fill="#111" />
          <Rect x={4.8} y={1.1} w={1.4} h={0.5} fill="#111" />
          <Rect x={3} y={1.1} w={0.6} h={0.4} fill="#ffffff" />
          <Rect x={6.6} y={1.1} w={0.6} h={0.4} fill="#ffffff" />
        </g>
      )
    case 'bowtie':
      return (
        <g>
          <Rect x={3.8} y={2.2} w={1.2} h={1.2} fill="#ec4d8c" />
          <Rect x={6} y={2.2} w={1.2} h={1.2} fill="#ec4d8c" />
          <Rect x={5} y={2.5} w={1} h={0.6} fill="#a8195a" />
        </g>
      )
    case 'apron':
      return (
        <g>
          <Rect x={3} y={3.2} w={5} h={1.8} fill="#7a4a2b" />
          <Rect x={4} y={3.2} w={3} h={0.5} fill="#946039" />
          <Rect x={4.5} y={4.1} w={2} h={0.6} fill="#5d371f" />
        </g>
      )
    default:
      return null
  }
}

// สัตว์พิกเซลตัวเล็กถือแก้วกาแฟ เดินไปมาที่ขอบล่างของจอ — คลิกค้างลากไปวางที่ไหนก็ได้ ปล่อยแล้วตกลงพื้น
// เมาส์ชี้ (หรือแตะบนมือถือ) เพื่อเปิดแผงเปลี่ยนสีและเครื่องแต่งกาย
function Critter() {
  const elRef = useRef(null)
  const [mode, setMode] = useState('walk') // walk | idle | drag | fall
  const modeRef = useRef('walk')
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)
  const [placement, setPlacement] = useState({ down: false, left: 0 })
  const [look, setLook] = useState(loadLook)
  const s = useRef({
    x: 80,
    y: 0,
    vx: 0,
    vy: 0,
    dir: 1,
    timer: rand(2, 5),
    grab: { x: 0, y: 0 },
    last: { x: 0, y: 0, t: 0 },
    down: { x: 0, y: 0 },
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(look))
    } catch {
      // ไม่บันทึกก็ไม่เป็นไร
    }
  }, [look])

  const switchMode = (next) => {
    modeRef.current = next
    setMode(next)
  }

  const setPanel = (next) => {
    if (next) {
      // วางแผงเหนือตัวน้อง (ถ้าชิดขอบบนให้ไว้ใต้) และไม่ให้ล้นขอบจอซ้าย/ขวา
      const st = s.current
      const centered = st.x + (W - POP_W) / 2
      const clamped = Math.min(Math.max(centered, 8), window.innerWidth - POP_W - 8)
      setPlacement({ down: st.y < POP_H + 16, left: clamped - st.x })
    }
    openRef.current = next
    setOpen(next)
  }

  useEffect(() => {
    const st = s.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // บนมือถือมี bottom nav สูง 64px — ให้เดินอยู่เหนือมัน
    const floorY = () => window.innerHeight - H - (window.innerWidth < 768 ? 64 : 0)
    st.y = floorY()
    let raf
    let prev = performance.now()

    const paint = () => {
      if (elRef.current) elRef.current.style.transform = `translate(${st.x}px, ${st.y}px)`
    }

    const tick = (now) => {
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now
      const mode = modeRef.current
      const maxX = window.innerWidth - W
      const floor = floorY()

      if (mode === 'walk' || mode === 'idle') {
        st.y = floor
        if (!openRef.current) {
          st.timer -= dt
          if (mode === 'walk') {
            st.x += st.dir * SPEED * dt
            if (st.x <= 0 || st.x >= maxX) {
              st.dir = -st.dir
              st.x = Math.min(Math.max(st.x, 0), maxX)
            }
          }
          if (st.timer <= 0 && !reduceMotion) {
            if (mode === 'walk' && Math.random() < 0.4) switchMode('idle')
            else {
              if (Math.random() < 0.4) st.dir = -st.dir
              switchMode('walk')
            }
            st.timer = rand(1.5, 4.5)
          }
        }
      } else if (mode === 'fall') {
        st.vy += GRAVITY * dt
        st.x += st.vx * dt
        st.y += st.vy * dt
        if (st.y < 0) {
          st.y = 0
          st.vy = Math.abs(st.vy) * 0.3
        }
        if (st.x <= 0 || st.x >= maxX) {
          st.vx = -st.vx * 0.5
          st.x = Math.min(Math.max(st.x, 0), maxX)
        }
        if (st.y >= floor) {
          st.y = floor
          if (st.vy > 300) {
            st.vy = -st.vy * 0.3 // เด้งเล็กน้อย
          } else {
            st.vy = 0
            st.vx = 0
            st.timer = rand(0.5, 1.5)
            switchMode('idle')
          }
        }
      }
      paint()
      raf = requestAnimationFrame(tick)
    }

    const onResize = () => {
      st.x = Math.min(st.x, Math.max(window.innerWidth - W, 0))
      if (modeRef.current !== 'drag') st.y = floorY()
    }
    window.addEventListener('resize', onResize)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // แตะนอกตัวน้อง/กด Esc เพื่อปิดแผง (สำหรับมือถือที่ไม่มี hover)
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (elRef.current && !elRef.current.contains(e.target)) setPanel(false)
    }
    const onKey = (e) => e.key === 'Escape' && setPanel(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const onPointerDown = (e) => {
    const st = s.current
    e.currentTarget.setPointerCapture(e.pointerId)
    st.grab = { x: e.clientX - st.x, y: e.clientY - st.y }
    st.last = { x: e.clientX, y: e.clientY, t: performance.now() }
    st.down = { x: e.clientX, y: e.clientY }
    st.vx = 0
    st.vy = 0
    switchMode('drag')
  }

  const onPointerMove = (e) => {
    if (modeRef.current !== 'drag') return
    const st = s.current
    if (openRef.current && Math.hypot(e.clientX - st.down.x, e.clientY - st.down.y) > 5) setPanel(false)
    const now = performance.now()
    const dt = (now - st.last.t) / 1000
    if (dt > 0) {
      // ความเร็วล่าสุดของเมาส์ ใช้เป็นแรงเหวี่ยงตอนปล่อย
      st.vx = (e.clientX - st.last.x) / dt
      st.vy = (e.clientY - st.last.y) / dt
    }
    st.last = { x: e.clientX, y: e.clientY, t: now }
    st.x = Math.min(Math.max(e.clientX - st.grab.x, 0), window.innerWidth - W)
    st.y = Math.min(Math.max(e.clientY - st.grab.y, 0), window.innerHeight - H)
  }

  const onPointerUp = (e) => {
    if (modeRef.current !== 'drag') return
    const st = s.current
    const moved = Math.hypot(e.clientX - st.down.x, e.clientY - st.down.y) > 5
    if (!moved && e.pointerType !== 'mouse') setPanel(!openRef.current) // แตะบนมือถือ = เปิด/ปิดแผง
    st.vx = Math.max(-900, Math.min(900, st.vx))
    st.vy = Math.max(-900, Math.min(900, st.vy))
    switchMode('fall')
  }

  const color = COLORS.find((c) => c.id === look.color) || COLORS[0]
  const has = (id) => look.costumes.includes(id)
  const toggleCostume = (item) =>
    setLook((prev) => {
      const without = prev.costumes.filter((id) => id !== item.id)
      if (prev.costumes.includes(item.id)) return { ...prev, costumes: without }
      // slot เดียวกันถอดชิ้นเก่าออก
      const sameSlot = COSTUMES.filter((c) => c.slot === item.slot).map((c) => c.id)
      return { ...prev, costumes: [...without.filter((id) => !sameSlot.includes(id)), item.id] }
    })

  const visualMode = open && mode === 'walk' ? 'idle' : mode
  const stopDrag = (e) => e.stopPropagation() // คลิกในแผงต้องไม่ไปเริ่มลากตัวน้อง

  return (
    <div
      ref={elRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={(e) => e.pointerType === 'mouse' && modeRef.current !== 'drag' && setPanel(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && modeRef.current !== 'drag' && setPanel(false)}
      className="fixed top-0 left-0 z-20 touch-none select-none"
      style={{ width: W, height: H, cursor: mode === 'drag' ? 'grabbing' : 'grab', willChange: 'transform' }}
    >
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label="น้องพิกเซลถือแก้วกาแฟ ชี้หรือแตะเพื่อเปลี่ยนสีและเครื่องแต่งกาย"
        className={`critter critter-${visualMode}`}
      >
        <defs>
          <linearGradient id="critterGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color.a} />
            <stop offset="100%" stopColor={color.b} />
          </linearGradient>
        </defs>
        <g transform={`translate(${PAD_X * C} ${PAD_TOP * C})`}>
          <Rect x={2} y={0} w={7} h={5} fill="url(#critterGrad)" />
          <Rect x={0} y={2} w={BODY_COLS} h={2} fill="url(#critterGrad)" />
          {!has('shades') && (
            <>
              <Rect x={3} y={1} w={1} h={1.2} fill="#111" />
              <Rect x={7} y={1} w={1} h={1.2} fill="#111" />
            </>
          )}
          <Legs cols={[2, 4, 6, 8]} length={2} className="legs-stand" />
          <Legs cols={[2, 6]} length={2} className="legs-a" />
          <Legs cols={[4, 8]} length={1} className="legs-a" />
          <Legs cols={[4, 8]} length={2} className="legs-b" />
          <Legs cols={[2, 6]} length={1} className="legs-b" />

          {COSTUMES.filter((c) => has(c.id)).map((c) => (
            <Costume key={c.id} id={c.id} />
          ))}

          {/* แก้วกาแฟในมือขวา */}
          <g>
            <Rect x={9} y={0} w={2} h={2} fill="#f7f2ea" />
            <Rect x={9} y={0} w={2} h={0.5} fill="#6b3f23" />
            <Rect x={11} y={0.5} w={1} h={0.5} fill="#f7f2ea" />
            <Rect x={11.5} y={0.5} w={0.5} h={1.1} fill="#f7f2ea" />
            <Rect x={11} y={1.2} w={1} h={0.5} fill="#f7f2ea" />
            <rect className="critter-steam" x={9.6 * C} y={-1 * C} width={0.6 * C} height={0.8 * C} fill="#9aa0b8" />
            <rect className="critter-steam critter-steam-b" x={10.4 * C} y={-1.8 * C} width={0.6 * C} height={0.8 * C} fill="#9aa0b8" />
          </g>
        </g>
      </svg>

      {open && (
        <div
          onPointerDown={stopDrag}
          onPointerMove={stopDrag}
          onPointerUp={stopDrag}
          className="absolute z-30 cursor-default"
          style={{
            width: POP_W,
            left: placement.left,
            ...(placement.down ? { top: '100%', paddingTop: 8 } : { bottom: '100%', paddingBottom: 8 }),
          }}
        >
          <div className="rounded-lg bg-bg-surface p-3.5 shadow-card ring-1 ring-border">
            <p className="text-sm font-bold text-ink">ปรับแต่งน้อง</p>

            <p className="mt-2.5 text-xs text-ink-muted">สี</p>
            <div className="mt-1.5 flex flex-wrap gap-2" role="group" aria-label="สีตัวน้อง">
              {COLORS.map((c) => {
                const active = c.id === look.color
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={c.label}
                    aria-pressed={active}
                    title={c.label}
                    onClick={() => setLook((prev) => ({ ...prev, color: c.id }))}
                    className={`size-7 rounded-full ring-offset-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                      active ? 'ring-2 ring-ink' : 'ring-1 ring-border hover:scale-110'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${c.a}, ${c.b})` }}
                  />
                )
              })}
            </div>

            <p className="mt-3 text-xs text-ink-muted">เครื่องแต่งกาย</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label="เครื่องแต่งกาย">
              {COSTUMES.map((item) => {
                const active = has(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleCostume(item)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                      active
                        ? 'border-transparent bg-brand-strong text-white'
                        : 'border-border bg-bg-surface text-ink-muted hover:bg-brand-tint'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Critter
