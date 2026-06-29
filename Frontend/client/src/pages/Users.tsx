import { useEffect, useState } from 'react'
import { User } from '../types'
import { fmtDate } from '../utils/helpers'
import { Loader2, Plus, Users as UsersIcon, Shield, UserCheck, User as UserIcon, Pencil, Trash2, KeyRound } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

const ROLE_CONFIG = {
  ADMIN:   { label: 'Admin',   bg: '#ede9fe', color: '#7c3aed', border: '#c4b5fd', icon: <Shield size={10}/> },
  MANAGER: { label: 'Manager', bg: '#fef3c7', color: '#d97706', border: '#fcd34d', icon: <UserCheck size={10}/> },
  STAFF:   { label: 'Staff',   bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd', icon: <UserIcon size={10}/> },
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string) {
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444']
  return colors[name.charCodeAt(0) % colors.length]
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  
  // Add User Modal
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'STAFF' })
  
  // Edit User Modal
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState<User | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  
  // Reset Password Modal
  const [showReset, setShowReset] = useState(false)
  const [resetUserId, setResetUserId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetSaving, setResetSaving] = useState(false)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const load = () =>
    api.get('/users')
      .then(r => setUsers(r.data.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  // ─── CREATE USER ───────────────────────────────
  const submit = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Fill required fields'); return }
    setSaving(true)
    try {
      await api.post('/users', form)
      toast.success('User created')
      setShowForm(false)
      setForm({ name: '', email: '', phone: '', password: '', role: 'STAFF' })
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  // ─── DELETE USER ───────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('User deleted')
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete')
    }
  }

  // ─── EDIT USER ─────────────────────────────────
  const openEdit = (user: User) => {
    setEditForm(user)
    setShowEdit(true)
  }

  const handleUpdate = async () => {
    if (!editForm) return
    setEditSaving(true)
    try {
      await api.patch(`/users/${editForm.id}`, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
        isActive: editForm.isActive,
      })
      toast.success('User updated')
      setShowEdit(false)
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update')
    } finally { setEditSaving(false) }
  }

  // ─── RESET PASSWORD ────────────────────────────
  const openReset = (id: string) => {
    setResetUserId(id)
    setNewPassword('')
    setShowReset(true)
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setResetSaving(true)
    try {
      await api.patch(`/users/${resetUserId}/reset-password`, { newPassword })
      toast.success('Password reset successfully')
      setShowReset(false)
      setNewPassword('')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to reset password')
    } finally { setResetSaving(false) }
  }

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#0f1535' }}>Users</h1>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            {users.length} team member{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary btn-sm flex-shrink-0" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Add user
        </button>
      </div>

      {/* Role summary pills */}
      {users.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
            roleCounts[role] ? (
              <div
                key={role}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
              >
                {cfg.icon}
                {roleCounts[role]} {cfg.label}{roleCounts[role] > 1 ? 's' : ''}
              </div>
            ) : null
          ))}
        </div>
      )}

      {/* ─── ADD USER MODAL ───────────────────────── */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal max-w-sm">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f0f1f8' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#ede9fe' }}>
                  <UsersIcon size={14} style={{ color: '#7c3aed' }} />
                </div>
                <h3 className="font-semibold text-sm" style={{ color: '#0f1535' }}>Add user</h3>
              </div>
              <button className="btn btn-sm" style={{ color: '#6b7280' }} onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="p-5 space-y-3">
              {[
                { key: 'name',     label: 'Full name *',    type: 'text',     placeholder: 'Ramesh Sharma' },
                { key: 'email',    label: 'Email *',        type: 'email',    placeholder: 'ramesh@example.com' },
                { key: 'phone',    label: 'Phone',          type: 'tel',      placeholder: '9876543210' },
                { key: 'password', label: 'Password *',     type: 'password', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input
                    className="input"
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                  />
                </div>
              ))}

              <div>
                <label className="label">Role</label>
                <div className="flex gap-2">
                  {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => set('role', role)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: form.role === role ? cfg.bg : '#f7f8fc',
                        color: form.role === role ? cfg.color : '#6b7280',
                        border: `1.5px solid ${form.role === role ? cfg.border : '#e8eaf2'}`,
                      }}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid #f0f1f8' }}>
              <button className="btn" style={{ color: '#374151' }} onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={saving} style={{ minWidth: 80 }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save user'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── EDIT USER MODAL ──────────────────────── */}
      {showEdit && editForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="modal max-w-sm">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f0f1f8' }}>
              <h3 className="font-semibold text-sm" style={{ color: '#0f1535' }}>Edit User</h3>
              <button className="btn btn-sm" style={{ color: '#6b7280' }} onClick={() => setShowEdit(false)}>✕</button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <label className="label">Full name</label>
                <input className="input" type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" type="tel" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
              </div>
              <div>
                <label className="label">Role</label>
                <div className="flex gap-2">
                  {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setEditForm({...editForm, role: role as any})}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: editForm.role === role ? cfg.bg : '#f7f8fc',
                        color: editForm.role === role ? cfg.color : '#6b7280',
                        border: `1.5px solid ${editForm.role === role ? cfg.border : '#e8eaf2'}`,
                      }}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={e => setEditForm({...editForm, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="text-xs" style={{ color: '#374151' }}>Active</label>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid #f0f1f8' }}>
              <button className="btn" style={{ color: '#374151' }} onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={editSaving}>
                {editSaving ? <Loader2 size={14} className="animate-spin" /> : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── RESET PASSWORD MODAL ───────────────────── */}
      {showReset && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowReset(false)}>
          <div className="modal max-w-sm">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f0f1f8' }}>
              <div className="flex items-center gap-2">
                <KeyRound size={16} style={{ color: '#7c3aed' }} />
                <h3 className="font-semibold text-sm" style={{ color: '#0f1535' }}>Reset Password</h3>
              </div>
              <button className="btn btn-sm" style={{ color: '#6b7280' }} onClick={() => setShowReset(false)}>✕</button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <label className="label">New Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid #f0f1f8' }}>
              <button className="btn" style={{ color: '#374151' }} onClick={() => setShowReset(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleResetPassword} disabled={resetSaving}>
                {resetSaving ? <Loader2 size={14} className="animate-spin" /> : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TABLE / LOADING ────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" style={{ color: '#6366f1' }} size={24} />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl py-20 text-center" style={{ background: '#ffffff', border: '1px solid #e8eaf2' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#ede9fe' }}>
            <UsersIcon size={24} style={{ color: '#7c3aed' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#1f2937' }}>No users yet</p>
          <p className="text-xs mt-1 mb-4" style={{ color: '#9ca3af' }}>Add your first team member</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Add user
          </button>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e8eaf2', boxShadow: '0 1px 4px rgba(15,21,53,0.06)' }}>
          
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f1f8' }}>
                  <th className="th">User</th>
                  <th className="th">Email</th>
                  <th className="th">Phone</th>
                  <th className="th">Role</th>
                  <th className="th">Joined</th>
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const cfg = ROLE_CONFIG[u.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.STAFF
                  const avatarColor = getAvatarColor(u.name)
                  return (
                    <tr
                      key={u.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid #f7f8fc' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafbff')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: avatarColor }}>
                            {getInitials(u.name)}
                          </div>
                          <span className="text-sm font-medium" style={{ color: '#1f2937' }}>{u.name}</span>
                        </div>
                      </td>
                      <td className="td"><span className="text-xs" style={{ color: '#6b7280' }}>{u.email}</span></td>
                      <td className="td"><span className="text-xs" style={{ color: '#6b7280' }}>{u.phone || '—'}</span></td>
                      <td className="td">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td className="td"><span className="text-xs" style={{ color: '#9ca3af' }}>{fmtDate(u.createdAt)}</span></td>
                      <td className="td">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-indigo-50 transition" onClick={() => openEdit(u)} title="Edit">
                            <Pencil size={14} style={{ color: '#6366f1' }} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-amber-50 transition" onClick={() => openReset(u.id)} title="Reset Password">
                            <KeyRound size={14} style={{ color: '#d97706' }} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 transition" onClick={() => handleDelete(u.id)} title="Delete">
                            <Trash2 size={14} style={{ color: '#ef4444' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="block md:hidden divide-y" style={{ borderColor: '#f0f1f8' }}>
            {users.map(u => {
              const cfg = ROLE_CONFIG[u.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.STAFF
              const avatarColor = getAvatarColor(u.name)
              return (
                <div key={u.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: avatarColor }}>
                      {getInitials(u.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#1f2937' }}>{u.name}</p>
                      <p className="text-xs truncate" style={{ color: '#6b7280' }}>{u.email}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600" onClick={() => openEdit(u)}>Edit</button>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-600" onClick={() => openReset(u.id)}>Reset Pass</button>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600" onClick={() => handleDelete(u.id)}>Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}