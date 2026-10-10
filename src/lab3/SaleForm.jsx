// Lab 3.2 · ฟอร์มบันทึกยอดขาย — ตรวจด้วย validateSaleForm และสร้างเอกสารด้วย buildSale
import { useState } from 'react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'
import { BRANCHES, PAYMENTS, MAX_QTY, buildSale, validateSaleForm } from './saleModel.js'
import { formatCurrency } from '../lib/metrics'

const EMPTY = { branch: '', product_id: '', qty: '1', payment_method: '', customer_id: '' }
const field = 'w-full rounded-md border border-border bg-bg-surface px-3 py-2 text-sm text-ink'

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
      {error && <span role="alert" className="mt-1 block text-xs text-negative">{error}</span>}
    </label>
  )
}

function SaleForm({ products, uid }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const product = products?.find((p) => p.product_id === form.product_id)
  const qty = Number(form.qty)
  const total = product && Number.isInteger(qty) && qty > 0 ? product.price * qty : null

  async function submit(e) {
    e.preventDefault()
    const errs = validateSaleForm(form, products ?? [])
    setErrors(errs)
    setMessage(null)
    if (Object.keys(errs).length) return
    const { id, data } = buildSale(form, product, { uid })
    setSaving(true)
    try {
      await setDoc(doc(db, 'sales', id), { ...data, created_at: serverTimestamp() })
      setMessage({ ok: true, text: `บันทึกแล้ว ${id} · ${formatCurrency(data.revenue)}` })
      setForm((f) => ({ ...EMPTY, branch: f.branch, payment_method: f.payment_method }))
    } catch (err) {
      setMessage({ ok: false, text: err.code === 'permission-denied' ? 'ถูกปฏิเสธโดย Security Rules' : `บันทึกไม่สำเร็จ: ${err.message}` })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-lg bg-bg-surface p-4 shadow-card sm:p-6 xl:sticky xl:top-4">
      <h2 className="text-lg leading-7 font-bold text-ink">บันทึกยอดขาย</h2>
      <Field label="สาขา" error={errors.branch}>
        <select value={form.branch} onChange={set('branch')} className={field}>
          <option value="">เลือกสาขา</option>
          {BRANCHES.map((b) => <option key={b}>{b}</option>)}
        </select>
      </Field>
      <Field label="เมนู" error={errors.product_id}>
        <select value={form.product_id} onChange={set('product_id')} disabled={!products} className={field}>
          <option value="">{products ? 'เลือกเมนู' : 'กำลังโหลดเมนู…'}</option>
          {products?.map((p) => <option key={p.product_id} value={p.product_id}>{p.product_name} · ฿{p.price}</option>)}
        </select>
      </Field>
      <Field label={`จำนวน (1–${MAX_QTY})`} error={errors.qty}>
        <input inputMode="numeric" value={form.qty} onChange={set('qty')} className={field} />
      </Field>
      <Field label="วิธีชำระเงิน" error={errors.payment_method}>
        <select value={form.payment_method} onChange={set('payment_method')} className={field}>
          <option value="">เลือกวิธีชำระเงิน</option>
          {PAYMENTS.map((p) => <option key={p}>{p}</option>)}
        </select>
      </Field>
      <Field label="รหัสสมาชิก (ไม่บังคับ)" error={errors.customer_id}>
        <input value={form.customer_id} onChange={set('customer_id')} placeholder="C01234" className={field} />
      </Field>
      <p className="text-sm text-ink-muted">
        ยอดรวม <span className="text-lg font-bold text-ink tabular-nums">{total == null ? '–' : formatCurrency(total)}</span>
      </p>
      <button
        type="submit"
        disabled={saving || !products}
        className="w-full rounded-md bg-brand-strong px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {saving ? 'กำลังบันทึก…' : 'บันทึกยอดขาย'}
      </button>
      {message && (
        <p role="status" className={`text-sm ${message.ok ? 'text-positive' : 'text-negative'}`}>
          {message.ok ? '✅ ' : '❌ '}{message.text}
        </p>
      )}
    </form>
  )
}

export default SaleForm
