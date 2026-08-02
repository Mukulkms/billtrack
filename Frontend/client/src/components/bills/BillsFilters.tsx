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
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          className="input pl-9"
          placeholder="Search bills..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          aria-label="Search bills"
        />
      </div>

      <div className="grid grid-cols-2 sm:flex gap-2 sm:items-center">
        <div className="relative min-w-0">
          <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            className="input pl-8 pr-6 cursor-pointer w-full sm:w-[172px]"
            style={{ fontSize: 13 }}
            value={shopId}
            onChange={e => onShopChange(e.target.value)}
            aria-label="Filter by shop"
          >
            <option value="">All shops</option>
            {shops.map(s => <option key={s.id} value={s.id}>{s.shopName}</option>)}
          </select>
        </div>

        <div className="relative min-w-0">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            className="input pl-8 pr-6 cursor-pointer w-full sm:w-[172px]"
            style={{ fontSize: 13 }}
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
            className="btn btn-sm btn-ghost-primary flex-shrink-0 col-span-2 sm:col-span-1 justify-center sm:justify-start"
            onClick={() => { onShopChange(''); onCategoryChange('') }}
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      <div className="segmented flex w-full overflow-x-auto flex-nowrap" style={{ scrollbarWidth: 'none' }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            className={`segmented-item flex-shrink-0 ${status === f.value ? 'active' : ''}`}
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