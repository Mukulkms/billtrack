import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Shops from './pages/Shops'
import ShopForm from './pages/ShopForm'
import Bills from './pages/Bills'
import Reminders from './pages/Reminders'
import Weekly from './pages/Weekly'
import Users from './pages/Users'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { token } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="shops" element={<Shops />} />
        <Route path="shops/new" element={<ShopForm />} />
        <Route path="shops/:id/edit" element={<ShopForm />} />
        <Route path="bills" element={<Bills />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="weekly" element={<Weekly />} />
        <Route path="users" element={<Users />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
