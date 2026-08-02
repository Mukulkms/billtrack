import { useEffect, useState, Suspense, lazy } from 'react'
import { getBillsApi } from '../api/bills'
import { Bill } from '../types'
import { fmtAmount, fmtDate, daysLeft } from '../utils/helpers'
import ShopAvatar from '../components/ui/ShopAvatar'
import StatusPill from '../components/ui/StatusPill'
import { Loader2, CalendarDays } from 'lucide-react'

const PayModal = lazy(() => import('../components/modals/PayModal'))

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Weekly() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [payBill, setPayBill] = useState<Bill | null>(null)

  const load = () =>
  getBillsApi({ limit: 200 })
    .then(d => setBills(d.data || d.bills || (Array.isArray(d) ? d : [])))
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i); return d
  })
  const billsOn = (day: Date) =>
    bills.filter(b => {
      const d = new Date(b.dueDate); d.setHours(0, 0, 0, 0)
      return d.getTime() === day.getTime()
    })
  const weekPending = bills.filter(b => {
    const d = new Date(b.dueDate); d.setHours(0, 0, 0, 0)
    return b.status !== 'PAID' && d >= today && d <= week[6]
  })
  const weekTotal = weekPending.reduce((s, b) => s + Number(b.pendingAmount), 0)

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin" style={{ color: '#17140F' }} size={24} />
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-5">
      {payBill && (
        <Suspense fallback={<div className="modal-overlay"><Loader2 className="animate-spin text-white" size={22} /></div>}>
          <PayModal bill={payBill} onClose={() => { setPayBill(null); load() }} />
        </Suspense>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#17140F' }}>Weekly view</h1>
          <p className="text-xs mt-0.5" style={{ color: '#7A7566' }}>
            Expected this week:{' '}
            <span className="font-semibold" style={{ color: '#17140F' }}>{fmtAmount(weekTotal)}</span>
            {' '}from {weekPending.length} bill{weekPending.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: '#F0EDE4', border: '1px solid #DAD4C2' }}
        >
          <CalendarDays size={14} style={{ color: '#17140F' }} />
          <span className="text-xs font-semibold" style={{ color: '#17140F' }}>
            {today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* 7-day calendar grid — scrollable on mobile */}
      <div className="overflow-x-auto pb-1">
        <div className="grid grid-cols-7 gap-2" style={{ minWidth: 560 }}>
          {week.map((day, i) => {
            const isToday = day.getTime() === today.getTime()
            const dayBills = billsOn(day)
            const hasOverdue = dayBills.some(b => b.status !== 'PAID' && daysLeft(b.dueDate) < 0)

            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  background: '#ffffff',
                  border: `1.5px solid ${isToday ? '#17140F' : hasOverdue ? '#fca5a5' : '#E7E1D3'}`,
                  boxShadow: isToday ? '0 0 0 3px rgba(99,102,241,0.1)' : '0 1px 3px rgba(15,21,53,0.05)',
                }}
              >
                {/* Day header */}
                <div
                  className="p-2 text-center"
                  style={{
                    background: isToday
                      ? 'linear-gradient(135deg, #17140F, #3A362E)'
                      : '#F0EDE4',
                    borderBottom: `1px solid ${isToday ? 'transparent' : '#EFEADC'}`,
                  }}
                >
                  <p className="text-xs font-semibold" style={{ color: isToday ? 'rgba(255,255,255,0.8)' : '#A39D8A' }}>
                    {DAYS[day.getDay()]}
                  </p>
                  <p className="text-lg font-bold leading-tight" style={{ color: isToday ? '#ffffff' : '#17140F' }}>
                    {day.getDate()}
                  </p>
                </div>

                {/* Bill chips */}
                <div className="p-1.5 space-y-1 min-h-[72px]">
                  {dayBills.length === 0 && (
                    <p className="text-xs text-center mt-4" style={{ color: '#d1d5db' }}>—</p>
                  )}
                  {dayBills.map(b => {
                    const paid = b.status === 'PAID'
                    const over = !paid && daysLeft(b.dueDate) < 0
                    return (
                      <div
                        key={b.id}
                        className="rounded-lg p-1.5 cursor-pointer transition-all text-xs"
                        style={{
                          background: paid ? '#f0fdf4' : over ? '#fff1f2' : '#f5f3ff',
                          border: `1px solid ${paid ? '#bbf7d0' : over ? '#fca5a5' : '#ddd6fe'}`,
                          borderLeft: `3px solid ${paid ? '#16a34a' : over ? '#dc2626' : '#17140F'}`,
                        }}
                        onClick={() => !paid && setPayBill(b)}
                      >
                        <p className="font-semibold truncate" style={{ color: paid ? '#15803d' : over ? '#dc2626' : '#17140F' }}>
                          {b.shop?.shopName?.split(' ')[0]}
                        </p>
                        <p style={{ color: '#7A7566' }}>{fmtAmount(b.pendingAmount)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending table */}
      {weekPending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#17140F' }}>
            Pending this week
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#fff', border: '1px solid #E7E1D3', boxShadow: '0 1px 4px rgba(15,21,53,0.06)' }}
          >
            {/* Mobile: card list */}
            <div className="block md:hidden divide-y" style={{ borderColor: '#EFEADC' }}>
              {weekPending.map(b => {
                const dl = daysLeft(b.dueDate)
                return (
                  <div
                    key={b.id}
                    className="p-4 flex items-center gap-3 cursor-pointer transition-colors"
                    style={{ background: 'white' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FBF9F2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                    onClick={() => setPayBill(b)}
                  >
                    <ShopAvatar shop={b.shop as any} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#17140F' }}>
                        {b.shop?.shopName}
                      </p>
                      <p className="text-xs" style={{ color: '#7A7566' }}>
                        {b.billNumber} · {fmtDate(b.dueDate)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: '#17140F' }}>
                        {fmtAmount(b.pendingAmount)}
                      </p>
                      <p className="text-xs font-medium"
                        style={{ color: dl === 0 ? '#dc2626' : dl <= 2 ? '#d97706' : '#A39D8A' }}>
                        {dl === 0 ? 'Today!' : `${dl}d`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #EFEADC' }}>
                    <th className="th">Shop</th>
                    <th className="th">Bill #</th>
                    <th className="th">Amount</th>
                    <th className="th">Due</th>
                    <th className="th">Days left</th>
                    <th className="th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {weekPending.map(b => {
                    const dl = daysLeft(b.dueDate)
                    return (
                      <tr
                        key={b.id}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: '1px solid #F0EDE4' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FBF9F2')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setPayBill(b)}
                      >
                        <td className="td">
                          <div className="flex items-center gap-2">
                            <ShopAvatar shop={b.shop as any} />
                            <p className="text-xs font-medium" style={{ color: '#17140F' }}>{b.shop?.shopName}</p>
                          </div>
                        </td>
                        <td className="td">
                          <span className="text-xs font-mono" style={{ color: '#7A7566' }}>{b.billNumber}</span>
                        </td>
                        <td className="td">
                          <span className="text-sm font-semibold" style={{ color: '#17140F' }}>{fmtAmount(b.pendingAmount)}</span>
                        </td>
                        <td className="td">
                          <span className="text-xs" style={{ color: '#3A362E' }}>{fmtDate(b.dueDate)}</span>
                        </td>
                        <td className="td">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-lg"
                            style={{
                              background: dl === 0 ? '#fee2e2' : dl <= 2 ? '#fef3c7' : '#F0EDE4',
                              color: dl === 0 ? '#dc2626' : dl <= 2 ? '#d97706' : '#17140F',
                            }}
                          >
                            {dl === 0 ? 'Today!' : `${dl}d`}
                          </span>
                        </td>
                        <td className="td"><StatusPill status={b.status} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
