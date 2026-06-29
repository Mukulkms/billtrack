import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { getBillsApi, deleteBillApi } from '../api/bills'
import { getShopsApi } from '../api/shops'
import { Bill, Shop } from '../types'
import PayModal from '../components/modals/PayModal'
import AddBillModal from '../components/modals/AddBillModal'
import BillsTable from '../components/modals/BillsTable'
import BillDetailModal from '../components/modals/BillDetailModal'
import toast from 'react-hot-toast'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'OVERDUE', label: '🔴 Overdue' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'PAID', label: '✓ Paid' },
]

const PAGE_SIZE = 10  

export default function Bills() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [bills, setBills]     = useState<Bill[]>([])
  const [shops, setShops]     = useState<Shop[]>([])
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState(searchParams.get('status') || '')
  const [shopId, setShopId]   = useState(searchParams.get('shopId') || '')
  const [loading, setLoading] = useState(true)
  
  // 🔥 Pagination State
  const [page, setPage]       = useState(Number(searchParams.get('page')) || 1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  const [payBill, setPayBill]   = useState<Bill | null>(null)
  const [showAdd, setShowAdd]   = useState(false)
  const [viewBill, setViewBill] = useState<Bill | null>(null)
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({})

  const load = () => {
    setLoading(true)
    Promise.all([
      getBillsApi({ 
        search, 
        status: status || undefined, 
        shopId: shopId || undefined, 
        limit: PAGE_SIZE,
        page: page  // 🔥 API ko page bhejo
      }),
      getShopsApi()
    ])
      .then(([b, s]) => { 
        setBills(b.bills || b.data || b)
        setTotalPages(b.totalPages || 1)
        setTotalCount(b.totalCount || b.count || 0)
        setShops(s) 
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  // 🔥 Page change pe reload + URL update
  useEffect(() => { load() }, [search, status, shopId, page])

  // Filter change pe page reset karo
  const handleStatusChange = (val: string) => {
    setStatus(val)
    setPage(1)
    updateUrl({ status: val, page: '1' })
  }

  const handleShopChange = (val: string) => {
    setShopId(val)
    setPage(1)
    updateUrl({ shopId: val, page: '1' })
  }

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  // 🔥 URL sync taaki refresh pe same page rahe
  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    setSearchParams(params)
  }

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    updateUrl({ page: String(p) })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bill?')) return
    try {
      await deleteBillApi(id)
      toast.success('Bill deleted')
      load()
    } catch { toast.error('Delete failed') }
  }

  const togglePayments = (id: string) =>
    setExpandedPayments(p => ({ ...p, [id]: !p[id] }))

  // 🔥 Page numbers generate karo (max 5 dikhayenge)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="p-4 md:p-6 space-y-4">

      {/* Modals */}
      {payBill   && <PayModal bill={payBill} onClose={() => { setPayBill(null); load() }} />}
      {showAdd   && <AddBillModal shops={shops} onClose={() => { setShowAdd(false); load() }} />}
      {viewBill  && <BillDetailModal bill={viewBill} onClose={() => setViewBill(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#0f1535' }}>Bills</h1>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            {totalCount} bill{totalCount !== 1 ? 's' : ''} found
            {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
          </p>
        </div>
        <button className="btn btn-primary btn-sm flex-shrink-0" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add bill
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative">
          <Search size={13} style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none'
          }} />
          <input 
            className="input" 
            style={{ paddingLeft: 30, width: 180, fontSize: 13 }}
            placeholder="Search bills..." 
            value={search}
            onChange={e => handleSearchChange(e.target.value)} 
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f.value} className="btn btn-sm"
              style={status === f.value
                ? { background: '#6366f1', borderColor: '#6366f1', color: '#fff' }
                : { color: '#374151' }}
              onClick={() => handleStatusChange(f.value)}>
              {f.label}
            </button>
          ))}
        </div>

        <select 
          className="input" 
          style={{ width: 160, fontSize: 13 }}
          value={shopId} 
          onChange={e => handleShopChange(e.target.value)}
        >
          <option value="">All shops</option>
          {shops.map(s => <option key={s.id} value={s.id}>{s.shopName}</option>)}
        </select>
      </div>

      {/* Table */}
      <BillsTable
        bills={bills}
        loading={loading}
        expandedPayments={expandedPayments}
        onTogglePayments={togglePayments}
        onPay={setPayBill}
        onDelete={handleDelete}
        onView={setViewBill}
      />

      {/* 🔥 PAGINATION UI */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs" style={{ color: '#6b7280' }}>
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          
          <div className="flex items-center gap-1">
            {/* Prev */}
            <button 
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              style={{ border: '1px solid #e8eaf2' }}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((p, i) => (
              p === '...' ? (
                <span key={i} className="w-8 h-8 flex items-center justify-center text-xs" style={{ color: '#9ca3af' }}>...</span>
              ) : (
                <button
                  key={i}
                  onClick={() => goToPage(p as number)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all"
                  style={page === p 
                    ? { background: '#6366f1', color: '#fff', border: '1px solid #6366f1' }
                    : { color: '#374151', border: '1px solid #e8eaf2' }
                  }
                >
                  {p}
                </button>
              )
            ))}

            {/* Next */}
            <button 
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              style={{ border: '1px solid #e8eaf2' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}