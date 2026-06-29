import { Loader2, Trash2, ChevronDown, ChevronUp, FileText, Eye } from 'lucide-react'
import { Bill } from '../../types'
import { fmtAmount, fmtDate, daysLeft } from '../../utils/helpers'
import StatusPill from '../ui/StatusPill'
import ShopAvatar from '../ui/ShopAvatar'
import { Fragment } from 'react'

interface Props {
  bills: Bill[]
  loading: boolean
  expandedPayments: Record<string, boolean>
  onTogglePayments: (id: string) => void
  onPay: (bill: Bill) => void
  onDelete: (id: string) => void
  onView: (bill: Bill) => void   // ← new
}

export default function BillsTable({
  bills, loading, expandedPayments,
  onTogglePayments, onPay, onDelete, onView
}: Props) {

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin" style={{ color: '#6366f1' }} size={24} />
    </div>
  )

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: '#fff', border: '1px solid #e8eaf2', boxShadow: '0 1px 4px rgba(15,21,53,0.06)' }}>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f1f8' }}>
              {['Shop', 'Bill #', 'Amount', 'Paid', 'Bill date', 'Due date', 'Status', 'Actions'].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bills.map(b => {
              const dl = daysLeft(b.dueDate)
              const hasPayments = (b.payments?.length || 0) > 0
              const expanded = expandedPayments[b.id]
              return (
                <Fragment key={b.id}>
                  <tr className="transition-colors"
                    style={{ borderBottom: '1px solid #f7f8fc' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafbff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                    {/* Shop */}
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <ShopAvatar shop={b.shop as any} />
                        <div>
                          <p className="text-xs font-medium" style={{ color: '#1f2937' }}>{b.shop?.shopName}</p>
                          <p className="text-xs" style={{ color: '#9ca3af' }}>{b.shop?.ownerName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Bill # */}
                    <td className="td">
                      <p className="text-xs font-mono" style={{ color: '#374151' }}>{b.billNumber}</p>
                      {b.invoiceNumber && <p className="text-xs" style={{ color: '#9ca3af' }}>{b.invoiceNumber}</p>}
                    </td>

                    {/* Amount */}
                    <td className="td">
                      <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>
                        {fmtAmount(b.amount)}
                      </span>
                    </td>

                    {/* Paid */}
                    <td className="td">
                      <p className="text-xs font-semibold" style={{ color: '#059669' }}>{fmtAmount(b.paidAmount)}</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>left: {fmtAmount(b.pendingAmount)}</p>
                    </td>

                    {/* Bill Date */}
                    <td className="td">
                      <p className="text-xs" style={{ color: '#374151' }}>{fmtDate(b.billDate)}</p>
                    </td>

                    {/* Due date */}
                    <td className="td">
                      <p className="text-xs" style={{ color: '#374151' }}>{fmtDate(b.dueDate)}</p>
                      {b.status !== 'PAID' && (
                        <p className="text-xs mt-0.5 font-medium"
                          style={{ color: dl < 0 ? '#dc2626' : dl <= 3 ? '#d97706' : '#9ca3af' }}>
                          {dl < 0 ? `${Math.abs(dl)}d overdue` : dl === 0 ? 'Today!' : `in ${dl}d`}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="td">
                      <StatusPill
                        status={
                          (b.status === 'PENDING' || b.status === 'PARTIAL') && dl < 0
                            ? 'OVERDUE'
                            : b.status
                        }
                      />
                    </td>

                    {/* Actions */}
                    <td className="td">
                      <div className="flex gap-1.5 items-center">

                        {/* View button — always visible */}
                        <button
                          className="btn btn-sm"
                          title="View details"
                          style={{ color: '#6366f1', borderColor: '#e0e0ff' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '' }}
                          onClick={() => onView(b)}>
                          <Eye size={12} />
                        </button>

                        {b.status !== 'PAID' && (
                          <button className="btn btn-sm btn-success" onClick={() => onPay(b)}>Pay</button>
                        )}

                        {hasPayments && (
                          <button className="btn btn-sm" onClick={() => onTogglePayments(b.id)}>
                            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        )}

                        {b.shop?.whatsapp && b.status !== 'PAID' && (
                          <button className="wa-btn" onClick={() => {
                            const msg = encodeURIComponent(
                              `Namaste ${b.shop?.ownerName} ji 🙏\n\nBill: ${b.billNumber}\nAmount due: ${fmtAmount(b.pendingAmount)}\nDue date: ${fmtDate(b.dueDate)}\n\nKripaya jald payment karein. Shukriya!`
                            )
                            window.open(`https://wa.me/${b.shop?.whatsapp}?text=${msg}`, '_blank')
                          }}>WA</button>
                        )}

                        <button className="btn btn-sm" style={{ color: '#9ca3af' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = '#e2e5f0' }}
                          onClick={() => onDelete(b.id)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded payment rows */}
                  {expanded && hasPayments && b.payments?.map(p => (
                    <tr key={p.id} style={{ background: '#f0fdf4', borderBottom: '1px solid #d1fae5' }}>
                      <td colSpan={8} className="px-6 py-2">
                        <span className="text-xs" style={{ color: '#059669' }}>
                          ✓ {fmtAmount(p.amount)} · {p.mode} · {fmtDate(p.receivedAt)} · {p.receivedBy?.name}
                          {p.note ? ` · ${p.note}` : ''}
                        </span>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {bills.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: '#f3f4f6' }}>
            <FileText size={22} style={{ color: '#9ca3af' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: '#374151' }}>No bills found</p>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Try changing filters or add a new bill</p>
        </div>
      )}
    </div>
  )
}