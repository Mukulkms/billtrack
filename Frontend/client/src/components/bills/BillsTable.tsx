import { FileText } from 'lucide-react'
import { Bill } from '../../types'
import BillRow from './BillRow'

interface Props {
  bills: Bill[]
  loading: boolean
  expandedPayments: Record<string, boolean>
  onTogglePayments: (id: string) => void
  onPay: (bill: Bill) => void
  onDelete: (id: string) => void
  onView: (bill: Bill) => void
  onEdit: (bill: Bill) => void
  onAddBill?: () => void
}

const HEADERS = ['Shop', 'Bill #', 'Amount', 'Paid', 'Bill date', 'Due date', 'Status', 'Actions']

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
          {HEADERS.map((h, j) => (
            <td key={h} className="td">
              <div className="skeleton h-4" style={{ width: j === 0 ? '75%' : j === 6 ? 60 : '55%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default function BillsTable({ bills, loading, expandedPayments, onTogglePayments, onPay, onDelete, onView, onEdit, onAddBill }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 760 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
              {HEADERS.map(h => <th key={h} className="th">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : (
              bills.map(b => (
                <BillRow
                  key={b.id}
                  bill={b}
                  expanded={!!expandedPayments[b.id]}
                  onTogglePayments={onTogglePayments}
                  onPay={onPay}
                  onDelete={onDelete}
                  onView={onView}
                  onEdit={onEdit}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && bills.length === 0 && (
        <div className="py-20 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--color-primary-soft)', border: '1px solid var(--color-primary-border)' }}
          >
            <FileText size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <p className="text-sm font-semibold text-slate-700">No bills found</p>
          <p className="text-xs mt-1 text-slate-400">Try changing your filters, or add a new bill to get started</p>
          {onAddBill && (
            <button className="btn btn-primary btn-sm mt-4" onClick={onAddBill}>
              Add bill
            </button>
          )}
        </div>
      )}
    </div>
  )
}
