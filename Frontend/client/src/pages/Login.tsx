import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Receipt, Loader2, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('mukulkms@gmail.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try { await login(email, password); navigate('/') }
    catch (err: any) { toast.error(err.response?.data?.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0f1535' }}
    >
      {/* Subtle radial glow behind card */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm relative">

        {/* Logo mark */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
            }}
          >
            <Receipt size={24} className="text-white" />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#ffffff' }}
          >
            BillTracker Pro
          </h1>
          <p className="text-sm mt-1.5" style={{ color: '#6b7280' }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: '#ffffff',
            border: '1px solid #e8eaf2',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          }}
        >
          <form onSubmit={submit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="label" style={{ color: '#374151' }}>Email address</label>
              <div className="relative">
                <Mail
                  size={15}
                  style={{
                    position: 'absolute', left: 12,
                    top: '50%', transform: 'translateY(-50%)',
                    color: '#9ca3af', pointerEvents: 'none',
                  }}
                />
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label" style={{ color: '#374151' }}>Password</label>
              <div className="relative">
                <Lock
                  size={15}
                  style={{
                    position: 'absolute', left: 12,
                    top: '50%', transform: 'translateY(-50%)',
                    color: '#9ca3af', pointerEvents: 'none',
                  }}
                />
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              className="btn btn-lg w-full justify-center mt-2"
              type="submit"
              disabled={loading}
              style={{
                background: loading
                  ? '#4f46e5'
                  : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                border: 'none',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                borderRadius: 10,
              }}
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : 'Sign in →'
              }
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: '#4b5563' }}>
          BillTracker Pro · Stay Ahead, Get Paid
        </p>

      </div>
    </div>
  )
}