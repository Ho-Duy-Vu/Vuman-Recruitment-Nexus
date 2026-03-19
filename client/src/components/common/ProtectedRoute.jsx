import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsAuthenticated } from '../../store/authSlice'

export function ProtectedRoute({ allowedRoles = [], children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
    // Redirect by broad role buckets
    if (user.role === 'candidate') return <Navigate to="/candidate" replace />
    if (user.role === 'hr' || user.role === 'admin') return <Navigate to="/hr/kanban" replace />
    return <Navigate to="/jobs" replace />
  }

  return children
}

