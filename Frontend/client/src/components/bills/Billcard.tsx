import { Trash2, ChevronDown, ChevronUp, Eye, Pencil, MessageCircle } from 'lucide-react'
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

export default function BillCard({ bill: b, expanded, onTogglePayments, onPay, onDelete, onView, onEdit }: Props) {
  const dl = daysLeft(b.dueDate)
  const hasPayments = (b.payments?.length || 0) > 0
  const isOverdue = (b.status === 'PENDING' || b.status === 'PARTIAL') && dl < 0
  const isUrgent = !isOverdue && b.status !== 'PAID' && dl <= 3

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(15,21,53,0.05)' }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <ShopAvatar shop={b.shop as any} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{b.shop?.shopName}</p>
            <p className="text-xs text-slate-400 truncate font-mono">{b.billNumber}</p>
          </div>
        </div>
        <StatusPill status={isOverdue ? 'OVERDUE' : b.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-xl px-2.5 py-2" style={{ background: 'var(--color-bg)' }}>
          <p className="text-[10px] text-slate-400 mb-0.5">Total</p>
          <p className="text-xs font-bold text-slate-800">{fmtAmount(b.amount)}</p>
        </div>
        <div className="rounded-xl px-2.5 py-2" style={{ background: 'var(--color-success-bg)' }}>
          <p className="text-[10px] text-slate-400 mb-0.5">Paid</p>
          <p className="text-xs font-bold text-status-success">{fmtAmount(b.paidAmount)}</p>
        </div>
        <div className="rounded-xl px-2.5 py-2" style={{ background: b.pendingAmount > 0 ? 'var(--color-danger-bg)' : 'var(--color-success-bg)' }}>
          <p className="text-[10px] text-slate-400 mb-0.5">Left</p>
          <p className={`text-xs font-bold ${b.pendingAmount > 0 ? 'text-status-danger' : 'text-status-success'}`}>{fmtAmount(b.pendingAmount)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3.5 text-xs">
        <span className="text-slate-500">Due {fmtDate(b.dueDate)}</span>
        {b.status !== 'PAID' && (
          <span className={`font-semibold ${isOverdue ? 'text-status-danger' : isUrgent ? 'text-status-warning' : 'text-slate-400'}`}>
            {dl < 0 ? `${Math.abs(dl)}d overdue` : dl === 0 ? 'Due today' : `in ${dl}d`}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        {b.status !== 'PAID' && (
          <button className="btn btn-sm btn-success justify-between" onClick={() => onPay(b)}>Pay</button>
        )}

        {b.shop?.whatsapp && b.status !== 'PAID' && (
          <button
            className="wa-btn flex-1 justify-center"
            title="Send WhatsApp reminder"
            onClick={() => {
              const msg = encodeURIComponent(
                `Namaste ${b.shop?.ownerName} ji 🙏\n\nBill: ${b.billNumber}\nAmount due: ${fmtAmount(b.pendingAmount)}\nDue date: ${fmtDate(b.dueDate)}\n\nKripaya jald payment karein. Shukriya!`
              )
              window.open(`https://wa.me/${b.shop?.whatsapp}?text=${msg}`, '_blank')
            }}
          >
            <MessageCircle size={13} /> WA
          </button>
        )}

        <div className="action-group flex-shrink-0">
          <button className="action-item primary" title="View details" onClick={() => onView(b)}>
            <Eye size={14} />
          </button>
          <button className="action-item primary" title="Edit bill" onClick={() => onEdit(b)}>
            <Pencil size={14} />
          </button>
          {hasPayments && (
            <button className="action-item" title={expanded ? 'Hide payments' : 'Show payments'} onClick={() => onTogglePayments(b.id)}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          <button className="action-item danger" title="Delete bill" onClick={() => onDelete(b.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && hasPayments && (
        <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid var(--color-border-soft)' }}>
          {b.payments?.map(p => (
            <p key={p.id} className="text-xs text-status-success leading-relaxed">
              ✓ {fmtAmount(p.amount)} · {p.mode} · {fmtDate(p.receivedAt)}
              {p.receivedBy?.name ? ` · ${p.receivedBy.name}` : ''}
              {p.note ? ` · ${p.note}` : ''}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}