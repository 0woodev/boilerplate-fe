import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createQueryClient } from '@/lib/queryClient'
import {
  usePatchNotes,
  useCreatePatchNote,
  useUpdatePatchNote,
  useDeletePatchNote,
} from './usePatchNotes'

// Each renderHook gets a fresh QueryClient so cached data never leaks between
// tests; MSW fixtures are reset by the global afterEach (setup.ts).
function wrapper() {
  const client = createQueryClient()
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('usePatchNotes (MSW-mocked)', () => {
  it('returns the list sorted by date descending', async () => {
    const { result } = renderHook(() => usePatchNotes(), { wrapper: wrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const dates = result.current.data!.map(n => n.date)
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)))
    expect(dates[0]).toBe('2026-06-20')
  })

  it('useCreatePatchNote adds a note that appears in the refetched list', async () => {
    const Wrapper = wrapper()
    const list = renderHook(() => usePatchNotes(), { wrapper: Wrapper })
    const create = renderHook(() => useCreatePatchNote(), { wrapper: Wrapper })

    await waitFor(() => expect(list.result.current.isSuccess).toBe(true))
    const before = list.result.current.data!.length

    await create.result.current.mutateAsync({
      date: '2026-06-25',
      scope: 'docs',
      title: '새 문서 추가',
      user_body: 'hello',
      dev_body: 'dev hello',
    })

    await waitFor(() =>
      expect(list.result.current.data!.length).toBe(before + 1),
    )
    expect(list.result.current.data!.map(n => n.title)).toContain('새 문서 추가')
    // newest date should sort to the front
    expect(list.result.current.data![0].date).toBe('2026-06-25')
  })

  it('useUpdatePatchNote edits title and both bodies in the refetched list', async () => {
    const Wrapper = wrapper()
    const list = renderHook(() => usePatchNotes(), { wrapper: Wrapper })
    const update = renderHook(() => useUpdatePatchNote(), { wrapper: Wrapper })

    await waitFor(() => expect(list.result.current.isSuccess).toBe(true))

    await update.result.current.mutateAsync({
      id: 'pn-001',
      title: '수정된 제목',
      user_body: '수정된 사용자 본문',
      dev_body: '수정된 개발자 본문',
    })

    await waitFor(() => {
      const note = list.result.current.data!.find(n => n.patch_note_id === 'pn-001')
      expect(note?.title).toBe('수정된 제목')
      expect(note?.user_body).toBe('수정된 사용자 본문')
      expect(note?.dev_body).toBe('수정된 개발자 본문')
    })
  })

  it('useDeletePatchNote removes a note from the refetched list', async () => {
    const Wrapper = wrapper()
    const list = renderHook(() => usePatchNotes(), { wrapper: Wrapper })
    const del = renderHook(() => useDeletePatchNote(), { wrapper: Wrapper })

    await waitFor(() => expect(list.result.current.isSuccess).toBe(true))
    const before = list.result.current.data!.length

    await del.result.current.mutateAsync('pn-003')

    await waitFor(() =>
      expect(list.result.current.data!.length).toBe(before - 1),
    )
    expect(
      list.result.current.data!.find(n => n.patch_note_id === 'pn-003'),
    ).toBeUndefined()
  })
})
