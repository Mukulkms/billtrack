import { useState } from 'react'
import { Bill, PaymentMode } from '../../types'
import { fmtAmount, fmtDate, todayISO } from '../../utils/helpers'
import { createPaymentApi } from '../../api/payments'
import { Check, Loader2, X, Wallet, Banknote, Smartphone, Landmark, FileCheck2 } from 'lucide-react'
import ShopAvatar from '../ui/ShopAvatar'
import toast from 'react-hot-toast'

const MODES: { value: PaymentMode; label: string; icon: React.ReactNode }[] = [
  { value: 'CASH', label: 'Cash', icon: <Banknote size={14} /> },
  { value: 'UPI', label: 'UPI', icon: <Smartphone size={14} /> },
  { value: 'BANK', label: 'Bank', icon: <Landmark size={14} /> },
  { value: 'CHEQUE', label: 'Cheque', icon: <FileCheck2 size={14} /> },
]

export default function PayModal({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  const [form, setForm] = useState({ amount: String(bill.pendingAmount), mode: 'CASH' as PaymentMode, transactionId: '', note: '', receivedAt: todayISO() })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter valid amount'); return }
    setSaving(true)
    try {
      await createPaymentApi({ billId: bill.id, amount: parseFloat(form.amount), mode: form.mode, transactionId: form.transactionId || undefined, note: form.note || undefined, receivedAt: form.receivedAt })
      toast.success('Payment recorded'); onClose()
    } catch { toast.error('Payment failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal max-w-sm">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)' }}
            >
              <Wallet size={14} style={{ color: 'var(--color-success)' }} />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Record payment</h3>
          </div>
          <button className="btn btn-sm" style={{ padding: 6, color: 'var(--color-text-faint)' }} onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <ShopAvatar shop={bill.shop as any} size="lg" />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-800 truncate">{bill.shop?.shopName}</p>
              <p className="text-xs text-slate-400">{bill.billNumber}</p>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {fmtAmount(bill.pendingAmount)} <span className="text-xs font-normal text-slate-400">pending</span>
              </p>
              <p className="text-xs text-slate-400">Due: {fmtDate(bill.dueDate)}</p>
            </div>
          </div>

          <div>
            <label className="label">Amount received (₹) *</label>
            <input className="input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} />
          </div>

          <div>
            <label className="label">Payment mode</label>
            <div className="grid grid-cols-4 gap-1.5">
              {MODES.map(m => (
                <button
                  key={m.value}
                  type="button"
                  className="flex flex-col items-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-all"
                  style={
                    form.mode === m.value
                      ? { background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: '1.5px solid var(--color-primary-border)' }
                      : { background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1.5px solid var(--color-border)' }
                  }
                  onClick={() => set('mode', m.value)}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Date</label>
            <input className="input" type="date" value={form.receivedAt} onChange={e => set('receivedAt', e.target.value)} />
          </div>

          <div>
            <label className="label">Transaction ID</label>
            <input className="input" placeholder="UPI ref / cheque no..." value={form.transactionId} onChange={e => set('transactionId', e.target.value)} />
          </div>

          <div>
            <label className="label">Note</label>
            <input className="input" placeholder="Optional..." value={form.note} onChange={e => set('note', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid var(--color-border-soft)' }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={submit} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Confirm</>}
          </button>
        </div>
      </div>
    </div>
  )
}
