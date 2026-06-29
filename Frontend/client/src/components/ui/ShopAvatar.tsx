import { Shop } from '../../types'
import { initials, getShopColor } from '../../utils/helpers'

export default function ShopAvatar({ shop, size = 'sm' }: { shop?: Partial<Shop> | null; size?: 'sm' | 'lg' }) {
  const color = getShopColor(shop?.shopName || 'A')
  const sz = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-xs'
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-semibold flex-shrink-0`} style={{ background: color + '22', color }}>
      {initials(shop?.shopName)}
    </div>
  )
}
