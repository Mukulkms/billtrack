import { Loader2, FileText } from 'lucide-react'
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
}

const HEADERS = ['Shop', 'Bill #', 'Amount', 'Paid', 'Bill date', 'Due date', 'Status', 'Actions']

export default function BillsTable({ bills, loading, expandedPayments, onTogglePayments, onPay, onDelete, onView, onEdit }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-status-info" size={24} />
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
              {HEADERS.map(h => <th key={h} className="th">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {bills.map(b => (
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
            ))}
          </tbody>
        </table>
      </div>

      {bills.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-slate-100">
            <FileText size={22} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">No bills found</p>
          <p className="text-xs mt-1 text-slate-400">Try changing filters or add a new bill</p>
        </div>
      )}
    </div>
  )
}
