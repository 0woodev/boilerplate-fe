import { env } from './env'

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: Method
  body?: unknown
  query?: Record<string, string | number | undefined>
}

// --- Auth identity injection ---
// Placeholder auth: BE expects `X-Auth-User` (value = username) on non-public
// routes. AuthProvider calls setAuthUsername() on login/logout; the api wrapper
// reads it for each request. Module-level mutable state keeps the api layer free
// of React imports.
// TODO: replace placeholder X-Auth-User header with real JWT bearer auth
let currentUsername: string | null = null

export function setAuthUsername(username: string | null): void {
  currentUsername = username
}

export function getAuthUsername(): string | null {
  return currentUsername
}

// Paths that MUST NOT carry the auth header (public or pre-auth endpoints).
// Matched against the path (leading slash ensured).
const PUBLIC_PATH_PATTERNS: RegExp[] = [
  /^\/auth\//, // /auth/login, /auth/register
]

function isPublicPath(path: string): boolean {
  const normalized = path.startsWith('/') ? path : '/' + path
  return PUBLIC_PATH_PATTERNS.some(re => re.test(normalized))
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path.replace(/^\//, ''), env.BE_URL.endsWith('/') ? env.BE_URL : env.BE_URL + '/')
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

function buildHeaders(path: string, hasBody: boolean): HeadersInit | undefined {
  const headers: Record<string, string> = {}
  if (hasBody) headers['Content-Type'] = 'application/json'
  if (!isPublicPath(path) && currentUsername) {
    // TODO: replace placeholder X-Auth-User header with real JWT bearer auth
    headers['X-Auth-User'] = currentUsername
  }
  return Object.keys(headers).length > 0 ? headers : undefined
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query } = options
  const url = buildUrl(path, query)

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: buildHeaders(path, Boolean(body)),
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network request failed'
    throw new ApiError(0, null, message)
  }

  const text = await res.text()
  let data: unknown = undefined
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }

  if (!res.ok) {
    const msg = typeof data === 'object' && data && 'message' in data
      ? String((data as { message: unknown }).message)
      : `API ${method} ${path} failed (${res.status})`
    throw new ApiError(res.status, data, msg)
  }

  return data as T
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) => request<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
