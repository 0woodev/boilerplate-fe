import { http, HttpResponse } from 'msw'
import { env } from '@/lib/env'
import type { PatchNote } from '@/hooks/usePatchNotes'
import { patchNotes, resetPatchNotes } from './fixtures'

// Strip trailing slash so template-string concatenation yields a valid URL
const BASE = env.BE_URL.replace(/\/$/, '')

// Reset all in-memory fixtures between tests (called after each test).
export function resetFixtures() {
  resetPatchNotes()
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
