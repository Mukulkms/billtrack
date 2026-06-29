// src/pages/Shops.tsx
import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Loader2, Store, X } from 'lucide-react'
import { getShopsApi, deleteShopApi } from '../api/shops'
import { Shop } from '../types'
import toast from 'react-hot-toast'
import ShopCard from '../components/modals/ShopCard'
import { ShopWithStats, computeShopStats, FILTER_OPTIONS, SEARCH_BY_OPTIONS } from '../utils/ShopsUtils'

export default function Shops() {
  const [shopsWithStats, setShopsWithStats] = useState<ShopWithStats[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [searchBy, setSearchBy] = useState('name')
  const [filter, setFilter]     = useState('all')
  const [sortBy, setSortBy]     = useState<'name' | 'pending' | 'outstanding'>('name')

  const load = () => {
    setLoading(true)
    getShopsApi(1, 200)
      .then((data: Shop[]) => setShopsWithStats(computeShopStats(data)))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? All bills will also be deleted.`)) return
    try {
      await deleteShopApi(id)
      toast.success('Shop deleted')
      load()
    } catch { toast.error('Delete failed') }
  }

  const filtered = useMemo(() => {
    let list = [...shopsWithStats]

    if (filter === 'overdue') list = list.filter(s => s._hasOverdue)
    if (filter === 'pending') list = list.filter(s => s._pending > 0)
    if (filter === 'clear')   list = list.filter(s => s._isClear)

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(s => {
        if (searchBy === 'name')  return s.shopName?.toLowerCase().includes(q)
        if (searchBy === 'owner') return s.ownerName?.toLowerCase().includes(q)
        if (searchBy === 'phone') return s.phone?.includes(q) || s.whatsapp?.includes(q)
        if (searchBy === 'gstin') return s.gstNumber?.toLowerCase().includes(q)
        if (searchBy === 'city')  return s.city?.toLowerCase().includes(q)
        return true
      })
    }

    list.sort((a, b) => {
      if (sortBy === 'name')        return a.shopName.localeCompare(b.shopName)
      if (sortBy === 'pending')     return b._pending - a._pending
      if (sortBy === 'outstanding') return b._outstanding - a._outstanding
      return 0
    })

    return list
  }, [shopsWithStats, filter, search, searchBy, sortBy])

  const summary = useMemo(() => ({
    total:    shopsWithStats.length,
    overdue:  shopsWithStats.filter(s => s._hasOverdue).length,
    pending:  shopsWithStats.filter(s => s._pending > 0).length,
    totalDue: shopsWithStats.reduce((s, x) => s + x._outstanding, 0),
  }), [shopsWithStats])

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#0f1535' }}>Shops</h1>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            {summary.total} shops · ₹{summary.totalDue.toLocaleString('en-IN')} total due
          </p>
        </div>
        <Link to="/shops/new" className="btn btn-primary btn-sm flex-shrink-0">
          <Plus size={14} /> Add shop
        </Link>
      </div>

      {/* Summary pills */}
      {!loading && shopsWithStats.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[
            { label: `${summary.total} Total`,                   bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' },
            { label: `${summary.overdue} Overdue`,               bg: '#fff1f2', color: '#dc2626', border: '#fca5a5' },
            { label: `${summary.pending} Pending`,               bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
            { label: `${summary.total - summary.pending} Clear`, bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
          ].map(p => (
            <div key={p.label} className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
              {p.label}
            </div>
          ))}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <select className="input" style={{ width: 130, fontSize: 12 }} value={searchBy} onChange={e => setSearchBy(e.target.value)}>
          {SEARCH_BY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
          <input
            className="input w-full"
            style={{ paddingLeft: 30, paddingRight: search ? 30 : 12, fontSize: 13 }}
            placeholder={`Search by ${SEARCH_BY_OPTIONS.find(o => o.value === searchBy)?.label}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map(f => (
            <button key={f.value} className="btn btn-sm"
              style={filter === f.value ? { background: '#6366f1', borderColor: '#6366f1', color: '#fff' } : { color: '#374151' }}
              onClick={() => setFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>

        <select className="input" style={{ width: 150, fontSize: 12 }} value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
          <option value="name">Sort: Name</option>
          <option value="pending">Sort: Pending bills</option>
          <option value="outstanding">Sort: Outstanding ₹</option>
        </select>
      </div>

      {!loading && search && (
        <p className="text-xs" style={{ color: '#6b7280' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" style={{ color: '#6366f1' }} size={24} />
        </div>

      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-20 text-center" style={{ background: '#ffffff', border: '1px solid #e8eaf2' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#ede9fe' }}>
            <Store size={24} style={{ color: '#7c3aed' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#1f2937' }}>No shops found</p>
          <p className="text-xs mt-1 mb-4" style={{ color: '#9ca3af' }}>
            {search ? 'Try different search or clear filters' : 'Add your first shop to get started'}
          </p>
          {search
            ? <button className="btn btn-sm" onClick={() => { setSearch(''); setFilter('all') }}>Clear filters</button>
            : <Link to="/shops/new" className="btn btn-primary btn-sm"><Plus size={14} /> Add shop</Link>
          }
        </div>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(shop => (
            <ShopCard key={shop.id} shop={shop} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}