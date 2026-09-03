import { useEffect, useMemo, useState } from 'react'
import { Loader2, History, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPaymentHistoryApi, deletePaymentHistoryApi, PaymentHistoryEntry } from '../api/paymentHistory'
import { fmtAmount, fmtDate } from '../utils/helpers'
import BillsPagination from '../components/bills/BillsPagination'

const PAGE_SIZE = 10

export default function PaymentHistory() {
  const [entries, setEntries] = useState<PaymentHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    getPaymentHistoryApi()
      .then(setEntries)
      .catch(() => toast.error('Payment history load nahi hui'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(e =>
      e.shopName.toLowerCase().includes(q) ||
      (e.ownerName || '').toLowerCase().includes(q) ||
      e.billNumber.toLowerCase().includes(q)
    )
  }, [entries, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Search ya list change hone par page 1 pe reset, warna aisa page dikh sakta hai jo exist hi na kare
  useEffect(() => { setPage(1) }, [search])
  useEffect(() => { if (page > totalPages) setPage(totalPages) }, [totalPages]) // eslint-disable-line

  const pageIds = pageItems.map(e => e.id)
  const allOnPageSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id))

  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // "Select all" is current page ke saare rows select/deselect karta hai (jo dikh rahe hain)
  const toggleAllOnPage = () => {
    setSelected(prev => {
      const next = new Set(prev)
      if (allOnPageSelected) pageIds.forEach(id => next.delete(id))
      else pageIds.forEach(id => next.add(id))
      return next
    })
  }

  // Poori filtered list (saare pages) select karne ka shortcut
  const selectAllFiltered = () => setSelected(new Set(filtered.map(e => e.id)))
  const clearSelection = () => setSelected(new Set())

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return
    if (!confirm(`${selected.size} payment history entries delete karein? Ye wapas nahi aayengi.`)) return
    setDeleting(true)
    try {
      await deletePaymentHistoryApi(Array.from(selected))
      toast.success(`${selected.size} entries delete ho gayi`)
      setSelected(new Set())
      load()
    } catch {
      toast.error('Delete nahi hua')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Payment History</h1>
          <p className="text-xs mt-0.5 text-slate-500">
            Fully paid bills, last 30 days · bill delete hone ke baad bhi yahan rehta hai · 30 din se purani entries khud delete ho jaati hain
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selected.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="btn btn-sm"
              style={{ color: 'var(--color-status-danger, #dc2626)', borderColor: 'var(--color-status-danger, #dc2626)' }}
            >
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Delete selected ({selected.size})
            </button>
          )}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              className="input pl-8"
              style={{ width: 220, fontSize: 13 }}
              placeholder="Search by shop, owner, bill #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-status-info" size={24} />
        </div>
      ) : (
        <div className="card overflow-hidden">
          {filtered.length > 0 && (
            <div className="flex items-center gap-3 px-3 py-2 flex-wrap" style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
                <input type="checkbox" checked={allOnPageSelected} onChange={toggleAllOnPage} />
                Select all on this page
              </label>
              {filtered.length > PAGE_SIZE && (
                selected.size === filtered.length ? (
                  <button className="text-xs text-slate-500 underline" onClick={clearSelection}>Clear selection</button>
                ) : (
                  <button className="text-xs text-slate-500 underline" onClick={selectAllFiltered}>
                    Select all {filtered.length} matching entries
                  </button>
                )
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
                  <th className="th" style={{ width: 36 }}></th>
                  {['Shop', 'Bill #', 'Amount', 'Bill date', 'Paid on'].map(h => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map(e => (
                  <tr key={e.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
                    <td className="td">
                      <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleOne(e.id)} />
                    </td>
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

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-slate-100">
                <History size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                {search ? 'No matching results' : 'No payment history yet'}
              </p>
              <p className="text-xs mt-1 text-slate-400">
                {search ? 'Try a different name or bill number' : 'Fully paid bills will show up here'}
              </p>
            </div>
          )}

          <BillsPagination page={page} totalPages={totalPages} totalCount={filtered.length} pageSize={PAGE_SIZE} onGoToPage={setPage} />
        </div>
      )}
    </div>
  )
}
