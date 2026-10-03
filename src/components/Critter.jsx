import { useEffect, useRef, useState } from 'react'

const CELL = 6
const COLS = 11
const ROWS = 7
const SPEED = 45 // px/s ตอนเดิน
const GRAVITY = 1800 // px/s²
const BODY = '#dc7455'

// พิกเซลอาร์ตขนาด 11×7: ตัว (คอลัมน์ 2–8), แขน 2 ข้าง (แถว 2–3), ตาดำ, ขา 4 ข้าง
const LEG_COLS = [2, 4, 6, 8]

function Legs({ cols, length, className }) {
  return (
    <g className={className}>
      {cols.map((c) => (
        <rect key={c} x={c * CELL} y={(ROWS - length) * CELL} width={CELL} height={length * CELL} fill={BODY} />
      ))}
    </g>
  )
}

const rand = (min, max) => min + Math.random() * (max - min)

// สัตว์พิกเซลตัวเล็กเดินไปมาที่ขอบล่างของจอ — คลิกค้างลากไปวางที่ไหนก็ได้ ปล่อยแล้วตกลงพื้น
function Critter() {
  const elRef = useRef(null)
  const [mode, setMode] = useState('walk') // walk | idle | drag | fall
  const modeRef = useRef('walk')
  const s = useRef({ x: 80, y: 0, vx: 0, vy: 0, dir: 1, timer: rand(2, 5), grab: { x: 0, y: 0 }, last: { x: 0, y: 0, t: 0 } })

  const W = COLS * CELL
  const H = ROWS * CELL
  const switchMode = (next) => {
    modeRef.current = next
    setMode(next)
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
  }, [H, W])

  const onPointerDown = (e) => {
    const st = s.current
    e.currentTarget.setPointerCapture(e.pointerId)
    st.grab = { x: e.clientX - st.x, y: e.clientY - st.y }
    st.last = { x: e.clientX, y: e.clientY, t: performance.now() }
    st.vx = 0
    st.vy = 0
    switchMode('drag')
  }

  const onPointerMove = (e) => {
    if (modeRef.current !== 'drag') return
    const st = s.current
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

  const onPointerUp = () => {
    if (modeRef.current !== 'drag') return
    const st = s.current
    st.vx = Math.max(-900, Math.min(900, st.vx))
    st.vy = Math.max(-900, Math.min(900, st.vy))
    switchMode('fall')
  }

  return (
    <div
      ref={elRef}
      aria-hidden="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="fixed top-0 left-0 z-20 touch-none select-none"
      style={{ width: W, height: H, cursor: mode === 'drag' ? 'grabbing' : 'grab', willChange: 'transform' }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges" className={`critter critter-${mode}`}>
        <rect x={2 * CELL} y={0} width={7 * CELL} height={5 * CELL} fill={BODY} />
        <rect x={0} y={2 * CELL} width={COLS * CELL} height={2 * CELL} fill={BODY} />
        <rect x={3 * CELL} y={CELL} width={CELL} height={CELL * 1.2} fill="#111" />
        <rect x={7 * CELL} y={CELL} width={CELL} height={CELL * 1.2} fill="#111" />
        <Legs cols={LEG_COLS} length={2} className="legs-stand" />
        <Legs cols={[2, 6]} length={2} className="legs-a" />
        <Legs cols={[4, 8]} length={1} className="legs-a" />
        <Legs cols={[4, 8]} length={2} className="legs-b" />
        <Legs cols={[2, 6]} length={1} className="legs-b" />
      </svg>
    </div>
  )
}

export default Critter
