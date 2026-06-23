import { api } from './api'

// Placeholder auth user. TODO: replace placeholder X-Auth-User header with real JWT bearer auth
export interface AuthUser {
  userId: string
  username: string
}

const STORAGE_KEY = 'auth_user'

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function storeUser(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export async function loginApi(username: string, password: string): Promise<AuthUser> {
  return api.post<AuthUser>('/auth/login', { username, password })
}

export async function registerApi(username: string, password: string): Promise<AuthUser> {
  return api.post<AuthUser>('/auth/register', { username, password })
}
