// src/components/shops/ShopCard.tsx
import { Link } from 'react-router-dom'
import { Phone, MapPin, Trash2, Pencil } from 'lucide-react'
import { fmtAmount, getShopColor, initials } from '../../utils/helpers'
import { ShopWithStats } from '../../utils/ShopsUtils'

interface Props {
  shop: ShopWithStats
  onDelete: (id: string, name: string) => void
}

export default function ShopCard({ shop, onDelete }: Props) {
  const color = getShopColor(shop.shopName)

  return (
    <div
      className="rounded-xl transition-all"
      style={{
        background: '#ffffff',
        border: `1px solid ${shop._hasOverdue ? '#fca5a5' : '#e8eaf2'}`,
        boxShadow: '0 1px 4px rgba(15,21,53,0.06)',
        overflow: 'hidden',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,21,53,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,21,53,0.06)')}
    >
      <div style={{ height: 3, background: color, opacity: 0.75 }} />

      <div className="p-4">
        {/* Identity + actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: color + '18', color }}
            >
              {initials(shop.shopName)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: '#1f2937' }}>{shop.shopName}</p>
              <p className="text-xs truncate" style={{ color: '#6b7280' }}>{shop.ownerName}</p>
            </div>
          </div>

          <div className="flex gap-1 flex-shrink-0">
            <Link
              to={`/shops/${shop.id}/edit`}
              className="btn btn-sm"
              style={{ padding: '4px 8px', color: '#6366f1' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d2fe' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e5f0' }}
            >
              <Pencil size={12} />
            </Link>
            <button
              className="btn btn-sm"
              style={{ padding: '4px 8px', color: '#9ca3af' }}
              onClick={() => onDelete(shop.id, shop.shopName)}
              onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.background = '#fff1f2' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = '#e2e5f0'; e.currentTarget.style.background = '#fff' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-1 mb-3">
          {shop.phone && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: '#6b7280' }}>
              <Phone size={11} style={{ flexShrink: 0 }} /> {shop.phone}
              {shop.whatsapp && shop.whatsapp !== shop.phone && (
                <span style={{ color: '#9ca3af' }}>· WA: {shop.whatsapp}</span>
              )}
            </p>
          )}
          {shop.city && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: '#6b7280' }}>
              <MapPin size={11} style={{ flexShrink: 0 }} />
              {[shop.city, shop.state, shop.pincode].filter(Boolean).join(', ')}
            </p>
          )}
          {shop.gstNumber && (
            <p className="text-xs font-mono" style={{ color: '#9ca3af' }}>GST: {shop.gstNumber}</p>
          )}
          {shop.email && (
            <p className="text-xs truncate" style={{ color: '#9ca3af' }}>{shop.email}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center rounded-xl p-3 mb-3" style={{ background: '#f7f8fc' }}>
          <div>
            <p className="text-sm font-bold" style={{ color: '#1f2937' }}>{shop.bills?.length || 0}</p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>Bills</p>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: shop._pending > 0 ? '#dc2626' : '#9ca3af' }}>
              {shop._pending}
            </p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>Pending</p>
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: shop._outstanding > 0 ? '#d97706' : '#9ca3af' }}>
              {fmtAmount(shop._outstanding)}
            </p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>Due</p>
          </div>
        </div>

        {/* Status badge */}
        {shop._hasOverdue && (
          <div className="mb-3 px-2 py-1 rounded-lg text-xs font-semibold text-center"
            style={{ background: '#fff1f2', color: '#dc2626', border: '1px solid #fca5a5' }}>
            ⚠️ Overdue bills present
          </div>
        )}
        {shop._isClear && (
          <div className="mb-3 px-2 py-1 rounded-lg text-xs font-semibold text-center"
            style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
            ✓ All clear
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={`/bills?shopId=${shop.id}`} className="btn btn-sm flex-1 justify-center" style={{ fontSize: 12 }}>
            View bills →
          </Link>
          {shop.whatsapp && shop._pending > 0 && (
            <button
              className="btn btn-sm"
              style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a', padding: '4px 10px', fontSize: 12 }}
              onClick={() => {
                const msg = encodeURIComponent(
                  `Namaste ${shop.ownerName} ji 🙏\n\nAapka ${shop._pending} bill${shop._pending !== 1 ? 's' : ''} pending hai totaling ${fmtAmount(shop._outstanding)}.\nKripaya jald payment karein.\n\n— BillTracker Pro`
                )
                window.open(`https://wa.me/${shop.whatsapp}?text=${msg}`, '_blank')
              }}
            >
              💬 WA
            </button>
          )}
        </div>
      </div>
    </div>
  )
}