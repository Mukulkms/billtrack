import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, FileText, Users, LogOut, Receipt, Menu, X, Bell, CalendarDays } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shops', label: 'Shops', icon: Store },
  { to: '/bills', label: 'Bills', icon: FileText },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/weekly', label: 'Weekly view', icon: CalendarDays },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
]

const SIDEBAR_BG = '#F3EFE6'
const BORDER = '1px solid #E7E1D3'

function NavItems({ onClose }: { onClose?: () => void }) {
  const { user, logout, isAdmin } = useAuth()

  const handleLogout = () => {
    onClose?.()
    logout()
  }

  return (
    <>
      <div className="px-4 py-5 flex items-center justify-between" style={{ borderBottom: BORDER }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#17140F' }}>
            <Receipt size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight" style={{ color: '#17140F' }}>BillTracker</p>
            <p className="text-[10px] font-medium" style={{ color: '#C2790C' }}>Pro</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="transition-colors md:hidden" style={{ color: '#7A7566' }}>
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2.5">
        {NAV.filter(n => !n.adminOnly || isAdmin).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) => clsx('nav-item', isActive && 'active')}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} />
                <span>{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#F0C34E' }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: BORDER }}>
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: '#17140F' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: '#17140F' }}>{user?.name}</p>
            <p className="text-[10px] capitalize" style={{ color: '#C2790C' }}>{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-full text-xs font-medium transition-all"
          style={{ background: '#FFFDF9', border: '1px solid #E7E1D3', color: '#7A7566' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#B4432E')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#7A7566')}
        >
          <LogOut size={13} /> Logout
        </button>
      </div>
    </>
  )
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <aside
        className="hidden md:flex w-56 flex-shrink-0 flex-col"
        style={{ background: SIDEBAR_BG, borderRight: BORDER }}
      >
        <NavItems />
      </aside>

      <button
        className="md:hidden fixed top-3.5 left-3.5 z-50 w-9 h-9 flex items-center justify-center rounded-full transition-colors"
        style={{ background: SIDEBAR_BG, border: BORDER, color: '#17140F' }}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 backdrop-blur-sm"
          style={{ background: 'rgba(23,20,15,0.45)' }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className="md:hidden fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-300"
        style={{
          background: SIDEBAR_BG,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: open ? '4px 0 24px rgba(23,20,15,0.2)' : 'none',
        }}
      >
        <NavItems onClose={() => setOpen(false)} />
      </aside>
    </>
  )
}
