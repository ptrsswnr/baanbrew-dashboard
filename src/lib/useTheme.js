import { useCallback, useEffect, useState } from 'react'

// ธีมสว่าง/มืด: เก็บค่าที่ผู้ใช้เลือกใน localStorage ถ้ายังไม่เคยเลือกใช้ค่าของเครื่อง (prefers-color-scheme)
// สคริปต์ใน index.html ตั้ง data-theme ก่อนหน้าจอวาด เพื่อไม่ให้ขาววูบตอนโหลด
const KEY = 'baanbrew-theme'

function readStored() {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'dark' || v === 'light' ? v : null
  } catch {
    return null // โหมดส่วนตัวหรือบล็อกข้อมูลเว็บไซต์ อ่านไม่ได้ก็ใช้ค่าเครื่อง
  }
}

function initialTheme() {
  return (
    readStored() ?? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  )
}

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(KEY, next)
      } catch {
        /* เก็บไม่ได้ก็ไม่เป็นไร ธีมยังเปลี่ยนในหน้านี้ */
      }
      return next
    })
  }, [])

  return { theme, toggle }
}
