import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'

// Route-level code splitting: each page ships as its own chunk and is
// fetched only when the user navigates to it, instead of bloating the
// initial bundle with every page up front.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Shops = lazy(() => import('./pages/Shops'))
const ShopForm = lazy(() => import('./pages/ShopForm'))
const Bills = lazy(() => import('./pages/Bills'))
const Reminders = lazy(() => import('./pages/Reminders'))
const Weekly = lazy(() => import('./pages/Weekly'))
const PaymentHistory = lazy(() => import('./pages/PaymentHistory'))
const Users = lazy(() => import('./pages/Users'))

function PageFallback() {
  return (
    <div className="flex justify-center items-center py-24">
      <Loader2 className="animate-spin" size={22} style={{ color: 'var(--color-primary, #6366f1)' }} />
    </div>
  )
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { token } = useAuth()
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="shops" element={<Shops />} />
          <Route path="shops/:id/edit" element={<ShopForm />} />
          <Route path="shops/new" element={<ShopForm />} />
          <Route path="bills" element={<Bills />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="weekly" element={<Weekly />} />
          <Route path="payment-history" element={<PaymentHistory />} />
          <Route path="users" element={<Users />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
