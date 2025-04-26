// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return null // or a spinner
  if (!isAuthenticated) return <Navigate to="/register" replace />
  return children
}

export default ProtectedRoute
