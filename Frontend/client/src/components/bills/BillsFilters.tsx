import { Search, Store, Tag, X } from 'lucide-react'
import { Shop, Category } from '../../types'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'PAID', label: 'Paid' },
]

interface Props {
  search: string
  status: string
  shopId: string
  categoryId: string
  shops: Shop[]
  categories: Category[]
  onSearchChange: (v: string) => void
  onStatusChange: (v: string) => void
  onShopChange: (v: string) => void
  onCategoryChange: (v: string) => void
}

export default function BillsFilters({
  search, status, shopId, categoryId, shops, categories,
  onSearchChange, onStatusChange, onShopChange, onCategoryChange,
}: Props) {
  const hasActiveFilters = !!(shopId || categoryId)

  return (
    <div className="filter-bar space-y-3">
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="input pl-9"
            placeholder="Search by bill number, invoice, shop..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            aria-label="Search bills"
          />
        </div>

        <div className="relative">
          <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            className="input pl-8 pr-8 cursor-pointer"
            style={{ width: 172, fontSize: 13 }}
            value={shopId}
            onChange={e => onShopChange(e.target.value)}
            aria-label="Filter by shop"
          >
            <option value="">All shops</option>
            {shops.map(s => <option key={s.id} value={s.id}>{s.shopName}</option>)}
          </select>
        </div>

        <div className="relative">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            className="input pl-8 pr-8 cursor-pointer"
            style={{ width: 172, fontSize: 13 }}
            value={categoryId}
            onChange={e => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            className="btn btn-sm btn-ghost-primary flex-shrink-0"
            onClick={() => { onShopChange(''); onCategoryChange('') }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="segmented">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            className={`segmented-item ${status === f.value ? 'active' : ''}`}
            onClick={() => onStatusChange(f.value)}
            aria-pressed={status === f.value}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
