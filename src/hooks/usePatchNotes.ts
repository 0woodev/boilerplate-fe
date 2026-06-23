import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type PatchNoteScope = 'be' | 'fe' | 'infra' | 'root' | 'docs'
export type PatchNoteSource = 'activity' | 'manual'

export interface PatchNote {
  patch_note_id: string
  date: string // YYYY-MM-DD
  scope: PatchNoteScope
  title: string
  body: string // markdown, may be ""
  source: PatchNoteSource
  created_at: string
  updated_at: string
}

export interface CreatePatchNoteInput {
  date: string
  scope: PatchNoteScope
  title: string
  body?: string
}

export interface UpdatePatchNoteInput {
  id: string
  title?: string
  body?: string
}

const PATCH_NOTES_KEY = ['patch-notes'] as const

export function usePatchNotes() {
  return useQuery({
    queryKey: PATCH_NOTES_KEY,
    queryFn: () =>
      api.get<{ patch_notes: PatchNote[] }>('/patch-notes').then(r => r.patch_notes),
  })
}

export function useCreatePatchNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePatchNoteInput) =>
      api.post<PatchNote>('/patch-notes', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATCH_NOTES_KEY })
    },
  })
}

export function useUpdatePatchNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: UpdatePatchNoteInput) =>
      api.patch<PatchNote>(`/patch-notes/${id}`, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATCH_NOTES_KEY })
    },
  })
}

export function useDeletePatchNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/patch-notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATCH_NOTES_KEY })
    },
  })
}
