import { useEffect, useState } from 'react'
import { Sparkles, AlertTriangle, Clock, MessageCircle, Loader2, RefreshCw } from 'lucide-react'
import { getPaymentInsightsApi, PaymentInsights, ShopInsightGroup } from '../../api/insights'
import { fmtAmount } from '../../utils/helpers'
import ShopAvatar from '../ui/ShopAvatar'

function ShopRow({ g, kind }: { g: ShopInsightGroup; kind: 'overdue' | 'upcoming' }) {
  const accent = kind === 'overdue' ? '#dc2626' : '#d97706'
  const bg = kind === 'overdue' ? '#fff1f2' : '#fffbeb'
  const border = kind === 'overdue' ? '#fecdd3' : '#fde68a'

  const sendWA = () => {
    const num = g.whatsapp || g.phone
    if (!num) return
    const msg = encodeURIComponent(
      kind === 'overdue'
        ? `Namaste ${g.ownerName || g.shopName} ji 🙏\n\nAapka ${fmtAmount(g.pendingAmount)} ka payment ${g.maxDaysOverdue} din se overdue hai. Kripaya jald payment karein. Shukriya!`
        : `Namaste ${g.ownerName || g.shopName} ji 🙏\n\nAapka ${fmtAmount(g.pendingAmount)} ka payment jald due hone wala hai. Reminder ke roop mein bhej rahe hain. Shukriya!`
    )
    window.open(`https://wa.me/${num.replace(/\D/g, '')}?text=${msg}`, '_blank')
  }

  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <ShopAvatar shop={{ shopName: g.shopName } as any} />
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: '#1f2937' }}>{g.shopName}</p>
          <p className="text-[11px] font-medium" style={{ color: accent }}>
            {kind === 'overdue' ? `${g.maxDaysOverdue}d overdue` : 'due soon'} · {g.billCount} bill{g.billCount > 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold" style={{ color: '#1f2937' }}>{fmtAmount(g.pendingAmount)}</span>
        {(g.whatsapp || g.phone) && (
          <button className="wa-btn" onClick={sendWA} title="WhatsApp reminder bhejo">
            <MessageCircle size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function AIInsights() {
  const [data, setData] = useState<PaymentInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState<'overdue' | 'upcoming' | null>(null)

  const load = () => {
    setLoading(true)
    getPaymentInsightsApi()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#1f2937' }}>AI Payment Insights</p>
            <p className="eyebrow">bot alert</p>
          </div>
        </div>
        <button className="btn btn-sm" onClick={load} title="Refresh">
          <RefreshCw size={12} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4" style={{ color: '#9ca3af' }}>
          <Loader2 className="animate-spin" size={16} />
          <span className="text-sm">Sochte hue... payments check kar raha hu</span>
        </div>
      ) : !data ? (
        <p className="text-sm" style={{ color: '#9ca3af' }}>Abhi insights load nahi ho paye. Refresh try karo.</p>
      ) : (
        <>
          {/* Bot bubble */}
          <div
            className="rounded-xl px-4 py-3 mb-4 text-sm"
            style={{ background: '#f5f4ff', border: '1px solid #e0defc', color: '#374151', lineHeight: 1.5 }}
          >
            {data.summary}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Overdue */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={13} style={{ color: '#dc2626' }} />
                <span className="text-xs font-semibold" style={{ color: '#dc2626' }}>
                  Overdue · {fmtAmount(data.totalOverdueAmount)}
                </span>
              </div>
              <div className="space-y-1.5">
                {data.overdue.length === 0 && (
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Koi overdue payment nahi hai 🎉</p>
                )}
                {(showAll === 'overdue' ? data.overdue : data.overdue.slice(0, 3)).map(g => (
                  <ShopRow key={g.shopId} g={g} kind="overdue" />
                ))}
                {data.overdue.length > 3 && (
                  <button
                    className="text-xs font-medium"
                    style={{ color: '#6366f1' }}
                    onClick={() => setShowAll(showAll === 'overdue' ? null : 'overdue')}
                  >
                    {showAll === 'overdue' ? 'Kam dikhao' : `+${data.overdue.length - 3} aur dekho`}
                  </button>
                )}
              </div>
            </div>

            {/* Upcoming */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={13} style={{ color: '#d97706' }} />
                <span className="text-xs font-semibold" style={{ color: '#d97706' }}>
                  Jaldi due · {fmtAmount(data.totalUpcomingAmount)}
                </span>
              </div>
              <div className="space-y-1.5">
                {data.upcoming.length === 0 && (
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Agle 7 din mein kuch due nahi hai</p>
                )}
                {(showAll === 'upcoming' ? data.upcoming : data.upcoming.slice(0, 3)).map(g => (
                  <ShopRow key={g.shopId} g={g} kind="upcoming" />
                ))}
                {data.upcoming.length > 3 && (
                  <button
                    className="text-xs font-medium"
                    style={{ color: '#6366f1' }}
                    onClick={() => setShowAll(showAll === 'upcoming' ? null : 'upcoming')}
                  >
                    {showAll === 'upcoming' ? 'Kam dikhao' : `+${data.upcoming.length - 3} aur dekho`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
