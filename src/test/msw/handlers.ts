/**
 * MSW 핸들러 — 도메인별 mock API 응답 정의.
 *
 * 사용처:
 *   - tests: tests/setup.ts 에서 msw server 구동 시 사용
 *   - browser dev: src/test/msw/browser.ts 에서 브라우저 모드 mock
 *
 * 핸들러 추가 예시:
 *   import { http, HttpResponse } from 'msw'
 *   handlers.push(
 *     http.get('/api/users', () => HttpResponse.json([{ id: 'u1', name: 'Alice' }]))
 *   )
 */
import { http, HttpResponse, type RequestHandler } from 'msw'
import { env } from '@/lib/env'
import type { PatchNote } from '@/hooks/usePatchNotes'
import { patchNotes, resetPatchNotes } from './fixtures'

// Strip trailing slash so template-string concatenation yields a valid URL
const BASE = env.BE_URL.replace(/\/$/, '')

// Reset all in-memory fixtures between tests (called from setup.ts afterEach).
export function resetFixtures() {
  resetPatchNotes()
}

export const handlers: RequestHandler[] = [
  // 도메인별 핸들러 추가

  // --- Patch notes (changelog) ---
  http.get(`${BASE}/patch-notes`, () => {
    const sorted = [...patchNotes].sort((a, b) => b.date.localeCompare(a.date))
    return HttpResponse.json({ patch_notes: sorted })
  }),
  http.post(`${BASE}/patch-notes`, async ({ request }) => {
    const body = (await request.json()) as {
      date: string
      scope: PatchNote['scope']
      title: string
      user_body?: string
      dev_body?: string
    }
    const now = new Date().toISOString()
    const note: PatchNote = {
      patch_note_id: `pn-${Date.now()}`,
      date: body.date,
      scope: body.scope,
      title: body.title,
      user_body: body.user_body ?? '',
      dev_body: body.dev_body ?? '',
      source: 'manual',
      created_at: now,
      updated_at: now,
    }
    patchNotes.push(note)
    return HttpResponse.json(note, { status: 201 })
  }),
  http.patch(`${BASE}/patch-notes/:id`, async ({ request, params }) => {
    const { id } = params
    const note = patchNotes.find(n => n.patch_note_id === id)
    if (!note) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as {
      title?: string
      user_body?: string
      dev_body?: string
    }
    if (body.title !== undefined) note.title = body.title
    if (body.user_body !== undefined) note.user_body = body.user_body
    if (body.dev_body !== undefined) note.dev_body = body.dev_body
    note.updated_at = new Date().toISOString()
    return HttpResponse.json(note)
  }),
  http.delete(`${BASE}/patch-notes/:id`, ({ params }) => {
    const { id } = params
    const idx = patchNotes.findIndex(n => n.patch_note_id === id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    patchNotes.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
