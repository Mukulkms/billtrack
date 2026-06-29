import { createContext, useContext, useState, ReactNode } from 'react'
import { User } from '../types'
import { loginApi } from '../api/auth'
import api from '../api/client'  // 👈 tera axios instance
import toast from 'react-hot-toast'

interface AuthCtx { 
  user: User | null; 
  token: string | null; 
  login: (e: string, p: string) => Promise<void>; 
  logout: () => Promise<void>;  // 👈 async bana diya
  isAdmin: boolean; 
  isManager: boolean; 
}
const Ctx = createContext<AuthCtx>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => { 
    try { return JSON.parse(localStorage.getItem('bt_user') || 'null') } 
    catch { return null } 
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bt_token'))

  const login = async (email: string, password: string) => {
    try {
      const data = await loginApi(email, password)
      setUser(data.user); setToken(data.token)
      localStorage.setItem('bt_user', JSON.stringify(data.user))
      localStorage.setItem('bt_token', data.token)
      toast.success(`Welcome back, ${data.user.name}!`)
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed'
      toast.error(msg)
      throw err
    }
  }

  // 🔥 FIXED: Pehle backend ko batao, phir local clear
  const logout = async () => {
    try {
      await api.post('/auth/logout')  // 👈 Backend session hatao
    } catch (err) {
    } finally {
      setUser(null); setToken(null)
      localStorage.removeItem('bt_user'); localStorage.removeItem('bt_token')
      window.location.href = '/login'
    }
  }

  return (
    <Ctx.Provider value={{ user, token, login, logout, isAdmin: user?.role === 'ADMIN', isManager: user?.role === 'ADMIN' || user?.role === 'MANAGER' }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)