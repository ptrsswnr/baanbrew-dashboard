// Lab 3.3 · ด่านล็อกอินของแท็บสด: ยังไม่ล็อกอินจะไม่เรนเดอร์ LiveDashboard
// จึงไม่มี onSnapshot และไม่อ่าน Firestore เลยจนกว่าจะเข้าสู่ระบบ
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from './firebase.js'
import LiveDashboard from './LiveDashboard'

const AUTH_ERRORS = {
  'auth/unauthorized-domain': 'โดเมนนี้ยังไม่ได้รับอนุญาต เพิ่มใน Firebase Authentication → Settings → Authorized domains',
  'auth/operation-not-allowed': 'ยังไม่ได้เปิดการล็อกอินด้วย Google ใน Authentication → Sign-in method',
  'auth/popup-blocked': 'เบราว์เซอร์บล็อกหน้าต่างล็อกอิน อนุญาตป๊อปอัปสำหรับเว็บนี้แล้วลองใหม่',
  'auth/popup-closed-by-user': 'ปิดหน้าต่างล็อกอินก่อนเสร็จ ลองกดอีกครั้ง',
}

function LiveTab() {
  const [user, setUser] = useState(undefined) // undefined = กำลังตรวจสถานะ
  const [error, setError] = useState(null)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  async function login() {
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      setError(AUTH_ERRORS[e.code] ?? e.message)
    }
  }

  if (user === undefined) return <p className="text-ink-muted">กำลังตรวจสอบการเข้าสู่ระบบ…</p>

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-lg bg-bg-surface p-8 text-center shadow-card">
        <h2 className="text-xl font-bold text-ink">เข้าสู่ระบบเพื่อดูยอดขายสด</h2>
        <p className="mt-2 text-sm text-ink-muted">ข้อมูลยอดขายจาก Firestore เปิดให้เฉพาะผู้ที่ล็อกอินแล้ว</p>
        <button
          type="button"
          onClick={login}
          className="mt-6 rounded-md bg-brand-strong px-5 py-2.5 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          เข้าสู่ระบบด้วย Google
        </button>
        {error && <p role="alert" className="mt-4 text-sm text-negative">❌ {error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-end gap-3 text-sm">
        {user.photoURL && <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="size-8 rounded-full" />}
        <span className="font-medium text-ink">{user.displayName ?? user.email}</span>
        <button
          type="button"
          onClick={() => signOut(auth)}
          className="rounded-md border border-border bg-bg-surface px-3 py-1.5 text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
          ออกจากระบบ
        </button>
      </div>
      <LiveDashboard user={user} />
    </div>
  )
}

export default LiveTab
