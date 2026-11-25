import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Loading from './Loading'

export default function ProtectedRoute({ children, admin = false }) {
  const { user, authLoading } = useApp()
  const location = useLocation()
  if (authLoading) return <Loading label="Checking your account…" />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
