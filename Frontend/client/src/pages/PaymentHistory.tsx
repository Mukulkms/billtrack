import { useEffect, useState } from 'react'
import { Loader2, History } from 'lucide-react'
import { getPaymentHistoryApi, PaymentHistoryEntry } from '../api/paymentHistory'
import { fmtAmount, fmtDate } from '../utils/helpers'

export default function PaymentHistory() {
  const [entries, setEntries] = useState<PaymentHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPaymentHistoryApi()
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Payment History</h1>
        <p className="text-xs mt-0.5 text-slate-500">
          Fully paid bills, last 30 days · bill delete hone ke baad bhi yahan rehta hai
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-status-info" size={24} />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
                  {['Shop', 'Bill #', 'Amount', 'Bill date', 'Paid on'].map(h => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
                    <td className="td">
                      <p className="text-xs font-medium text-slate-800">{e.shopName}</p>
                      {e.ownerName && <p className="text-xs text-slate-400">{e.ownerName}</p>}
                    </td>
                    <td className="td"><p className="text-xs font-mono text-slate-600">{e.billNumber}</p></td>
                    <td className="td"><span className="text-sm font-semibold text-status-success">{fmtAmount(e.amount)}</span></td>
                    <td className="td"><p className="text-xs text-slate-600">{fmtDate(e.billDate)}</p></td>
                    <td className="td"><p className="text-xs text-slate-600">{fmtDate(e.paidAt)}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {entries.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-slate-100">
                <History size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">No payment history yet</p>
              <p className="text-xs mt-1 text-slate-400">Fully paid bills will show up here</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
