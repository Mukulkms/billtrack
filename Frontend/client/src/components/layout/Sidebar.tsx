import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, FileText, Bell, CalendarDays, Users, LogOut, Receipt, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shops', label: 'Shops', icon: Store },
  { to: '/bills', label: 'Bills', icon: FileText },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/weekly', label: 'Weekly', icon: CalendarDays },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
]

const SIDEBAR_BG = '#0F1535'
const BORDER = '1px solid rgba(255,255,255,0.07)'

function NavItems({ onClose }: { onClose?: () => void }) {
  const { user, logout, isAdmin } = useAuth()

  const handleLogout = () => {
    onClose?.()
    logout()
  }

  return (
    <>
      {/* Logo */}
      <div className="px-4 py-5 flex items-center justify-between" style={{ borderBottom: BORDER }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Receipt size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">BillTracker</p>
            <p className="text-[10px] font-medium" style={{ color: '#6366f1' }}>Pro</p>
          </div>
        </div>
        {/* Close button — only on mobile */}
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {NAV.filter(n => !n.adminOnly || isAdmin).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
              isActive
                ? 'font-semibold text-white'
                : 'font-normal text-gray-400 hover:text-gray-200 hover:bg-white/5'
            )}
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg, #1e2b6e 0%, #1a2560 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.3)',
              color: '#a5b4fc',
            } : {}}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} style={{ color: isActive ? '#818cf8' : undefined }} />
                <span>{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4" style={{ borderTop: BORDER }}>
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-200 truncate">{user?.name}</p>
            <p className="text-[10px] capitalize" style={{ color: '#6366f1' }}>{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all text-gray-500 hover:text-red-400"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
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

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* ── Desktop sidebar (md+) ── */}
      <aside
        className="hidden md:flex w-52 flex-shrink-0 flex-col"
        style={{ background: SIDEBAR_BG }}
      >
        <NavItems />
      </aside>

      {/* ── Mobile: Hamburger button ── */}
      <button
        className="md:hidden fixed top-3.5 left-3.5 z-50 w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:text-white transition-colors"
        style={{ background: SIDEBAR_BG, border: BORDER }}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile: Backdrop ── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile: Drawer ── */}
      <aside
        className="md:hidden fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-300"
        style={{
          background: SIDEBAR_BG,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: open ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <NavItems onClose={() => setOpen(false)} />
      </aside>
    </>
  )
}