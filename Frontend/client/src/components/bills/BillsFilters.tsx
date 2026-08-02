import { Search } from 'lucide-react'
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
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          className="input pl-8"
          style={{ width: 180, fontSize: 13 }}
          placeholder="Search bills..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            className={`btn btn-sm ${status === f.value ? 'btn-primary' : ''}`}
            onClick={() => onStatusChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <select className="input" style={{ width: 160, fontSize: 13 }} value={shopId} onChange={e => onShopChange(e.target.value)}>
        <option value="">All shops</option>
        {shops.map(s => <option key={s.id} value={s.id}>{s.shopName}</option>)}
      </select>

      <select className="input" style={{ width: 160, fontSize: 13 }} value={categoryId} onChange={e => onCategoryChange(e.target.value)}>
        <option value="">All categories</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
  )
}
