import { useEffect, useState } from 'react'
import { AlertCircle, Clock, Calendar, MessageCircle, Loader2, CheckCircle2, Phone, Settings } from 'lucide-react'
import { getUpcomingRemindersApi } from '../api/reminders'
import { Bill } from '../types'
import { fmtAmount, fmtDate, daysLeft } from '../utils/helpers'
import ShopAvatar from '../components/ui/ShopAvatar'
import PayModal from '../components/modals/PayModal'
import toast from 'react-hot-toast'

export default function Reminders() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [payBill, setPayBill] = useState<Bill | null>(null)
  
  // 🔥 Staff number jo manually enter hoga
  const [staffNumber, setStaffNumber] = useState(() => {
    return localStorage.getItem('reminder_staff_number') || ''
  })
  const [showNumberInput, setShowNumberInput] = useState(false)

  const load = () =>
    getUpcomingRemindersApi(30)
      .then(setBills)
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  // 🔥 Number save karne ka handler
  const saveStaffNumber = () => {
    const cleaned = staffNumber.replace(/\D/g, '') // Sirf digits
    if (cleaned.length < 10) {
      toast.error('Enter valid 10-digit number')
      return
    }
    localStorage.setItem('reminder_staff_number', cleaned)
    setStaffNumber(cleaned)
    setShowNumberInput(false)
    toast.success('Staff number saved!')
  }

  const sendWA = (b: Bill) => {
    // 🔴 Shop owner ka number nahi — staff number use karo
    const num = staffNumber.replace(/\D/g, '')
    
    if (!num || num.length < 10) {
      toast.error('Please set staff number first (click Settings)')
      setShowNumberInput(true)
      return
    }

    const dl = daysLeft(b.dueDate)
    const msg = encodeURIComponent(
      `*Bill Reminder* 📋\n\n` +
      `Shop: ${b.shop?.shopName}\n` +
      `Due Date: ${fmtDate(b.dueDate)}\n`+
      `Amount Due: ${fmtAmount(b.pendingAmount)}\n` +
      `Bill Date: ${fmtDate(b.billDate)}\n` +
      `${dl < 0 ? `⚠️ OVERDUE by ${Math.abs(dl)} days` : `⏰ Due in ${dl} days`}\n\n` +
      `Please follow up for payment.`
    )
    
    window.open(`https://wa.me/91${num}?text=${msg}`, '_blank')
  }

  const overdue = bills.filter(b => b.status === 'OVERDUE' || (b.status !== 'PAID' && daysLeft(b.dueDate) < 0))
  const soon    = bills.filter(b => b.status !== 'PAID' && daysLeft(b.dueDate) >= 0 && daysLeft(b.dueDate) <= 7)
  const later   = bills.filter(b => b.status !== 'PAID' && daysLeft(b.dueDate) > 7)

  const ReminderCard = ({ b }: { b: Bill }) => {
    const dl = daysLeft(b.dueDate)
    const isOver = dl < 0
    const isUrgent = !isOver && dl <= 3

    const accent = isOver ? '#dc2626' : isUrgent ? '#d97706' : '#6366f1'
    const bgColor = isOver ? '#fff1f2' : isUrgent ? '#fffbeb' : '#fafbff'
    const borderColor = isOver ? '#fca5a5' : isUrgent ? '#fcd34d' : '#e8eaf2'

    return (
      <div
        className="rounded-xl p-4 flex items-center gap-3 transition-all"
        style={{
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderLeft: `3px solid ${accent}`,
          boxShadow: '0 1px 3px rgba(15,21,53,0.05)',
        }}
      >
        <ShopAvatar shop={b.shop as any} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#1f2937' }}>
            {b.shop?.shopName}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            {b.billNumber} · {fmtAmount(b.pendingAmount)}
            {' · '}
            <span style={{ color: accent, fontWeight: 500 }}>
              {isOver ? `${Math.abs(dl)}d overdue` : `due in ${dl}d`}
            </span>
            {' · '}{fmtDate(b.dueDate)}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            className="wa-btn"
            onClick={() => sendWA(b)}
            title={`Send to ${staffNumber || 'staff'}`}
          >
            <MessageCircle size={12} /> WA
          </button>
          <button
            className="btn btn-sm btn-success"
            onClick={() => setPayBill(b)}
          >
            Pay
          </button>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin" style={{ color: '#6366f1' }} size={24} />
    </div>
  )

  const Section = ({ title, icon, color, bg, items }: {
    title: string; icon: React.ReactNode; color: string; bg: string; items: Bill[]
  }) => (
    <div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 w-fit" style={{ background: bg }}>
        <span style={{ color }}>{icon}</span>
        <h2 className="text-sm font-semibold" style={{ color }}>{title} ({items.length})</h2>
      </div>
      <div className="space-y-2">
        {items.map(b => <ReminderCard key={b.id} b={b} />)}
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      {payBill && <PayModal bill={payBill} onClose={() => { setPayBill(null); load() }} />}

      {/* Header + Staff Number Setting */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#0f1535' }}>Reminders</h1>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            {overdue.length + soon.length + later.length} bills need attention
          </p>
        </div>
        
        {/* 🔥 Staff Number Setting Button */}
        <button 
          onClick={() => setShowNumberInput(!showNumberInput)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
          style={{ 
            background: staffNumber ? '#d1fae5' : '#fef3c7',
            color: staffNumber ? '#059669' : '#d97706',
            border: `1px solid ${staffNumber ? '#a7f3d0' : '#fcd34d'}`
          }}
        >
          <Settings size={13} />
          {staffNumber ? `Staff: ${staffNumber}` : 'Set Staff Number'}
        </button>
      </div>

      {/* 🔥 Number Input Panel */}
      {showNumberInput && (
        <div 
          className="rounded-xl p-4 space-y-3"
          style={{ background: '#fafbff', border: '1px solid #e8eaf2' }}
        >
          <div className="flex items-center gap-2">
            <Phone size={16} style={{ color: '#6366f1' }} />
            <p className="text-sm font-medium" style={{ color: '#1f2937' }}>
              Enter Staff WhatsApp Number
            </p>
          </div>
          <p className="text-xs" style={{ color: '#6b7280' }}>
            All reminders will be sent to this number instead of shop owners.
          </p>
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="9876543210"
              value={staffNumber}
              onChange={e => setStaffNumber(e.target.value)}
              className="input flex-1"
              maxLength={10}
            />
            <button 
              onClick={saveStaffNumber}
              className="btn btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {!staffNumber && (
        <div 
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fcd34d' }}
        >
          <AlertCircle size={14} />
          Please set staff number above to send WhatsApp reminders
        </div>
      )}

      {overdue.length > 0 && (
        <Section title="Overdue" icon={<AlertCircle size={15} />}
          color="#dc2626" bg="#fee2e2" items={overdue} />
      )}
      {soon.length > 0 && (
        <Section title="Due this week" icon={<Clock size={15} />}
          color="#d97706" bg="#fef3c7" items={soon} />
      )}
      {later.length > 0 && (
        <Section title="Upcoming" icon={<Calendar size={15} />}
          color="#6366f1" bg="#ede9fe" items={later} />
      )}

      {overdue.length === 0 && soon.length === 0 && later.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#d1fae5' }}>
            <CheckCircle2 size={28} style={{ color: '#059669' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#1f2937' }}>All clear!</p>
          <p className="text-xs" style={{ color: '#9ca3af' }}>No pending bills right now 🎉</p>
        </div>
      )}
    </div>
  )
}