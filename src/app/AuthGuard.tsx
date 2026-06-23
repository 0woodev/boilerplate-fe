import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

/** Redirects to /login if not authenticated */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}

/** Redirects to / if already authenticated (for login page) */
export function LoginGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (user) return <Navigate to="/" replace />

  return <>{children}</>
}
