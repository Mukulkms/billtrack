import { useState } from 'react'
import { Bill, PaymentMode } from '../../types'
import { fmtAmount, fmtDate, todayISO } from '../../utils/helpers'
import { createPaymentApi } from '../../api/payments'
import { Check, Loader2 } from 'lucide-react'
import ShopAvatar from '../ui/ShopAvatar'
import toast from 'react-hot-toast'

export default function PayModal({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  const [form, setForm] = useState({ amount: String(bill.pendingAmount), mode: 'CASH' as PaymentMode, transactionId: '', note: '', receivedAt: todayISO() })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setForm(p => ({...p, [k]: v}))

  const submit = async () => {
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter valid amount'); return }
    setSaving(true)
    try {
      await createPaymentApi({ billId: bill.id, amount: parseFloat(form.amount), mode: form.mode, transactionId: form.transactionId || undefined, note: form.note || undefined, receivedAt: form.receivedAt })
      toast.success('Payment recorded ✓'); onClose()
    } catch { toast.error('Payment failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800"><h3 className="font-medium text-gray-100">Record payment</h3><button className="btn btn-sm" onClick={onClose}>✕</button></div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
            <ShopAvatar shop={bill.shop as any} size="lg" />
            <div>
              <p className="font-medium text-sm text-gray-100">{bill.shop?.shopName}</p>
              <p className="text-xs text-gray-500">{bill.billNumber}</p>
              <p className="text-lg font-semibold text-gray-100 mt-1">{fmtAmount(bill.pendingAmount)} <span className="text-sm font-normal text-gray-500">pending</span></p>
              <p className="text-xs text-gray-600">Due: {fmtDate(bill.dueDate)}</p>
            </div>
          </div>
          <div><label className="label">Amount received (₹) *</label><input className="input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Payment mode</label><select className="input" value={form.mode} onChange={e => set('mode', e.target.value as PaymentMode)}><option>CASH</option><option>UPI</option><option>BANK</option><option>CHEQUE</option></select></div>
            <div><label className="label">Date</label><input className="input" type="date" value={form.receivedAt} onChange={e => set('receivedAt', e.target.value)}/></div>
          </div>
          <div><label className="label">Transaction ID</label><input className="input" placeholder="UPI ref / cheque no..." value={form.transactionId} onChange={e => set('transactionId', e.target.value)}/></div>
          <div><label className="label">Note</label><input className="input" placeholder="Optional..." value={form.note} onChange={e => set('note', e.target.value)}/></div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-800">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={submit} disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin"/> : <><Check size={14}/> Confirm</>}</button>
        </div>
      </div>
    </div>
  )
}
