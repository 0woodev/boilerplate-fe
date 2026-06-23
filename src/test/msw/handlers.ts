import { http, HttpResponse } from 'msw'
import { env } from '@/lib/env'

// Strip trailing slash so template-string concatenation yields a valid URL
const BASE = env.BE_URL.replace(/\/$/, '')

// Domain fixtures were removed during generalization. Add your own fixture
// arrays here and repopulate them in resetFixtures() (called after each test).
export function resetFixtures() {
  // no-op placeholder — reset your fixtures here as you add them
}

export const handlers = [
  // --- Auth (placeholder — TODO: replace placeholder X-Auth-User header with real JWT bearer auth) ---
  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { username: string }
    return HttpResponse.json(
      {
        userId: `usr-${Date.now()}`,
        username: body.username,
      },
      { status: 201 },
    )
  }),
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { username: string }
    return HttpResponse.json({
      userId: 'usr-dev-001',
      username: body.username,
    })
  }),
]
