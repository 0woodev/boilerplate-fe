import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AuthUser } from '@/lib/auth'
import {
  getStoredUser,
  storeUser,
  clearStoredUser,
  loginApi,
  registerApi,
} from '@/lib/auth'
import { setAuthUsername } from '@/lib/api'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: replace placeholder X-Auth-User header with real JWT bearer auth
    const stored = getStoredUser()
    if (stored) {
      setUser(stored)
      setAuthUsername(stored.username)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const authUser = await loginApi(username, password)
    storeUser(authUser)
    setAuthUsername(authUser.username)
    setUser(authUser)
  }, [])

  const register = useCallback(async (username: string, password: string) => {
    const authUser = await registerApi(username, password)
    storeUser(authUser)
    setAuthUsername(authUser.username)
    setUser(authUser)
  }, [])

  const logout = useCallback(() => {
    clearStoredUser()
    setAuthUsername(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
