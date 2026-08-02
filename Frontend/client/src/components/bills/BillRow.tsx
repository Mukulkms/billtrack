import { Fragment } from 'react'
import { Trash2, ChevronDown, ChevronUp, Eye, Pencil } from 'lucide-react'
import { Bill } from '../../types'
import { fmtAmount, fmtDate, daysLeft } from '../../utils/helpers'
import StatusPill from '../ui/StatusPill'
import ShopAvatar from '../ui/ShopAvatar'

interface Props {
  bill: Bill
  expanded: boolean
  onTogglePayments: (id: string) => void
  onPay: (bill: Bill) => void
  onDelete: (id: string) => void
  onView: (bill: Bill) => void
  onEdit: (bill: Bill) => void
}

export default function BillRow({ bill: b, expanded, onTogglePayments, onPay, onDelete, onView, onEdit }: Props) {
  const dl = daysLeft(b.dueDate)
  const hasPayments = (b.payments?.length || 0) > 0
  const isOverdue = (b.status === 'PENDING' || b.status === 'PARTIAL') && dl < 0
  const isUrgent = !isOverdue && b.status !== 'PAID' && dl <= 3

  return (
    <Fragment>
      <tr className="table-row-hover transition-colors" style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
        <td className="td">
          <div className="flex items-center gap-3">
            <ShopAvatar shop={b.shop as any} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{b.shop?.shopName}</p>
              <p className="text-xs text-slate-400 truncate">{b.shop?.ownerName}</p>
            </div>
          </div>
        </td>

        <td className="td">
          <p className="text-xs font-mono text-slate-600">{b.billNumber}</p>
          {b.invoiceNumber && <p className="text-xs text-slate-400 mt-0.5">{b.invoiceNumber}</p>}
        </td>

        <td className="td">
          <span className="text-sm font-semibold text-slate-800">{fmtAmount(b.amount)}</span>
        </td>

        <td className="td">
          <p className="text-xs font-semibold text-status-success">{fmtAmount(b.paidAmount)}</p>
          <p className="text-xs text-slate-400 mt-0.5">left: {fmtAmount(b.pendingAmount)}</p>
        </td>

        <td className="td">
          <p className="text-xs text-slate-600">{fmtDate(b.billDate)}</p>
        </td>

        <td className="td">
          <p className="text-xs text-slate-600">{fmtDate(b.dueDate)}</p>
          {b.status !== 'PAID' && (
            <p className={`text-xs mt-1 font-medium ${isOverdue ? 'text-status-danger' : isUrgent ? 'text-status-warning' : 'text-slate-400'}`}>
              {dl < 0 ? `${Math.abs(dl)}d overdue` : dl === 0 ? 'Due today' : `in ${dl}d`}
            </p>
          )}
        </td>

        <td className="td">
          <StatusPill status={isOverdue ? 'OVERDUE' : b.status} />
        </td>

        <td className="td">
          <div className="flex gap-2 items-center flex-wrap">
            {b.status !== 'PAID' && (
              <button className="btn btn-sm btn-success" onClick={() => onPay(b)}>Pay</button>
            )}

            {b.shop?.whatsapp && b.status !== 'PAID' && (
              <button
                className="wa-btn"
                title="Send WhatsApp reminder"
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Namaste ${b.shop?.ownerName} ji 🙏\n\nBill: ${b.billNumber}\nAmount due: ${fmtAmount(b.pendingAmount)}\nDue date: ${fmtDate(b.dueDate)}\n\nKripaya jald payment karein. Shukriya!`
                  )
                  window.open(`https://wa.me/${b.shop?.whatsapp}?text=${msg}`, '_blank')
                }}
              >
                WA
              </button>
            )}

            <div className="action-group">
              <button className="action-item primary" title="View details" onClick={() => onView(b)}>
                <Eye size={13} />
              </button>
              <button className="action-item primary" title="Edit bill" onClick={() => onEdit(b)}>
                <Pencil size={13} />
              </button>
              {hasPayments && (
                <button className="action-item" title={expanded ? 'Hide payments' : 'Show payments'} onClick={() => onTogglePayments(b.id)}>
                  {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              )}
              <button className="action-item danger" title="Delete bill" onClick={() => onDelete(b.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </td>
      </tr>

      {expanded && hasPayments && b.payments?.map(p => (
        <tr key={p.id} className="status-card-success" style={{ borderBottom: '1px solid var(--color-success-border)' }}>
          <td colSpan={8} className="px-5 py-2.5">
            <span className="text-xs text-status-success">
              ✓ {fmtAmount(p.amount)} · {p.mode} · {fmtDate(p.receivedAt)} · {p.receivedBy?.name}
              {p.note ? ` · ${p.note}` : ''}
            </span>
          </td>
        </tr>
      ))}
    </Fragment>
  )
}
