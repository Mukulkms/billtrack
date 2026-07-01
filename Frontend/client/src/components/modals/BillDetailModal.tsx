import { X, Building2, FileText, CreditCard, Calendar, Hash } from 'lucide-react'
import { Bill } from '../../types'
import { fmtAmount, fmtDate, daysLeft } from '../../utils/helpers'
import StatusPill from '../ui/StatusPill'
import ShopAvatar from '../ui/ShopAvatar'

interface Props {
  bill: Bill
  onClose: () => void
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2.5"
      style={{ borderBottom: '1px solid #f0f1f8' }}>
      <span className="text-xs" style={{ color: '#9ca3af' }}>{label}</span>
      <span className="text-xs font-medium text-right" style={{ color: '#1f2937', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}

export default function BillDetailModal({ bill, onClose }: Props) {
  const dl = daysLeft(bill.dueDate)
  const displayStatus =
    (bill.status === 'PENDING' || bill.status === 'PARTIAL') && dl < 0
      ? 'OVERDUE'
      : bill.status

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,21,53,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: '#fff',
          boxShadow: '0 20px 60px rgba(15,21,53,0.18)',
          maxHeight: '90vh'
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #f0f1f8' }}>
          <div className="flex items-center gap-2">
            <FileText size={16} style={{ color: '#6366f1' }} />
            <span className="font-semibold text-sm" style={{ color: '#0f1535' }}>
              Bill Detail
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded"
              style={{ background: '#f3f4f6', color: '#374151' }}>
              {bill.billNumber}
            </span>
          </div>
          <button onClick={onClose} className="btn btn-sm"
            style={{ padding: '4px', color: '#9ca3af' }}>
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Shop Info */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Building2 size={13} style={{ color: '#6366f1' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6366f1' }}>Shop</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#f8f9ff', border: '1px solid #e8eaf2' }}>
              <ShopAvatar shop={bill.shop as any} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1f2937' }}>{bill.shop?.shopName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{bill.shop?.ownerName}</p>
                {bill.shop?.phone && (
                  <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{bill.shop?.phone}</p>
                )}
              </div>
            </div>
          </section>

          {/* Bill Info */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Hash size={13} style={{ color: '#6366f1' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6366f1' }}>Bill Info</span>
            </div>
            <div className="rounded-xl overflow-hidden"
              style={{ border: '1px solid #e8eaf2' }}>
              <div className="px-4">
                <InfoRow label="Bill Number" value={bill.billNumber} />
                {bill.invoiceNumber && <InfoRow label="Invoice Number" value={bill.invoiceNumber} />}
                <InfoRow label="Status" value={<StatusPill status={displayStatus} />} />
                <InfoRow label="Bill Date" value={fmtDate(bill.billDate)} />
                <InfoRow label="Due Date" value={
                  <span>
                    {fmtDate(bill.dueDate)}
                    {bill.status !== 'PAID' && (
                      <span className="ml-1.5 text-xs font-medium"
                        style={{ color: dl < 0 ? '#dc2626' : dl <= 3 ? '#d97706' : '#059669' }}>
                        ({dl < 0 ? `${Math.abs(dl)}d overdue` : dl === 0 ? 'Today!' : `${dl}d left`})
                      </span>
                    )}
                  </span>
                } />
                {bill.category?.name && <InfoRow label="Category" value={bill.category.name} />}
                {bill.remarks && <InfoRow label="Remark" value={bill.remarks} />}
                {(bill as any).description && <InfoRow label="Description" value={(bill as any).description} />}
              </div>
            </div>
          </section>

          {/* Payment Summary */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <CreditCard size={13} style={{ color: '#6366f1' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6366f1' }}>Payment</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Total', value: fmtAmount(bill.amount), color: '#1f2937', bg: '#f8f9ff' },
                { label: 'Paid', value: fmtAmount(bill.paidAmount), color: '#059669', bg: '#f0fdf4' },
                { label: 'Pending', value: fmtAmount(bill.pendingAmount), color: bill.pendingAmount > 0 ? '#dc2626' : '#059669', bg: bill.pendingAmount > 0 ? '#fef2f2' : '#f0fdf4' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: bg, border: '1px solid #e8eaf2' }}>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>{label}</p>
                  <p className="text-sm font-bold mt-1" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Payment History */}
          {(bill.payments?.length || 0) > 0 && (
            <section>
              <div className="flex items-center gap-1.5 mb-3">
                <Calendar size={13} style={{ color: '#6366f1' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6366f1' }}>
                  Payment History ({bill.payments!.length})
                </span>
              </div>
              <div className="space-y-2">
                {bill.payments!.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ background: '#f0fdf4', border: '1px solid #d1fae5' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: '#059669', color: '#fff' }}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#059669' }}>
                          {fmtAmount(p.amount)}
                        </p>
                        {p.note && <p className="text-xs" style={{ color: '#6b7280' }}>{p.note}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: '#374151' }}>{fmtDate(p.receivedAt)}</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>
                        {p.mode}{p.receivedBy?.name ? ` · ${p.receivedBy.name}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex justify-end"
          style={{ borderTop: '1px solid #f0f1f8' }}>
          <button className="btn btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
