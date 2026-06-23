import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  usePatchNotes,
  useCreatePatchNote,
  useUpdatePatchNote,
  useDeletePatchNote,
  type PatchNote,
  type PatchNoteScope,
} from '@/hooks/usePatchNotes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { ApiError } from '@/lib/api'

const SCOPES: PatchNoteScope[] = ['be', 'fe', 'infra', 'root', 'docs']

const SCOPE_BADGE: Record<PatchNoteScope, string> = {
  be: 'bg-blue-100 text-blue-700',
  fe: 'bg-green-100 text-green-700',
  infra: 'bg-amber-100 text-amber-700',
  root: 'bg-slate-100 text-slate-700',
  docs: 'bg-purple-100 text-purple-700',
}

function ScopeBadge({ scope }: { scope: PatchNoteScope }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
        SCOPE_BADGE[scope],
      )}
    >
      {scope}
    </span>
  )
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

interface EditState {
  id: string
  title: string
  body: string
}

interface CreateState {
  date: string
  scope: PatchNoteScope
  title: string
  body: string
}

function emptyCreateState(): CreateState {
  return { date: todayIso(), scope: 'fe', title: '', body: '' }
}

export function PatchNotesPage() {
  const { data, isLoading, isError } = usePatchNotes()
  const createMutation = useCreatePatchNote()
  const updateMutation = useUpdatePatchNote()
  const deleteMutation = useDeletePatchNote()

  const [editState, setEditState] = useState<EditState | null>(null)
  const [createState, setCreateState] = useState<CreateState | null>(null)

  // Group notes by date (already date-desc from the API).
  const groups = useMemo(() => {
    const map = new Map<string, PatchNote[]>()
    for (const note of data ?? []) {
      const list = map.get(note.date) ?? []
      list.push(note)
      map.set(note.date, list)
    }
    return [...map.entries()]
  }, [data])

  function reportError(err: unknown, title: string) {
    const description =
      err instanceof ApiError ? err.message : '알 수 없는 오류가 발생했습니다.'
    toast({ variant: 'destructive', title, description })
  }

  async function handleCreate() {
    if (!createState) return
    try {
      await createMutation.mutateAsync({
        date: createState.date,
        scope: createState.scope,
        title: createState.title,
        body: createState.body || undefined,
      })
      setCreateState(null)
    } catch (err) {
      reportError(err, '패치노트 생성 실패')
    }
  }

  async function handleUpdate() {
    if (!editState) return
    try {
      await updateMutation.mutateAsync({
        id: editState.id,
        title: editState.title,
        body: editState.body,
      })
      setEditState(null)
    } catch (err) {
      reportError(err, '패치노트 수정 실패')
    }
  }

  async function handleDelete(note: PatchNote) {
    try {
      await deleteMutation.mutateAsync(note.patch_note_id)
    } catch (err) {
      reportError(err, '패치노트 삭제 실패')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patch Notes</h1>
          <p className="text-sm text-muted-foreground">변경 이력 타임라인</p>
        </div>
        <Button onClick={() => setCreateState(emptyCreateState())}>
          <Plus className="h-4 w-4" />새 노트
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
      {isError && (
        <p className="text-sm text-destructive">목록을 불러오지 못했습니다.</p>
      )}
      {!isLoading && !isError && groups.length === 0 && (
        <p className="text-sm text-muted-foreground">아직 패치노트가 없습니다.</p>
      )}

      <div className="space-y-8">
        {groups.map(([date, notes]) => (
          <section key={date} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">{date}</h2>
            <div className="space-y-3">
              {notes.map(note => (
                <Card key={note.patch_note_id}>
                  <CardHeader className="flex-row items-start justify-between space-y-0 gap-2">
                    <div className="flex items-center gap-2">
                      <ScopeBadge scope={note.scope} />
                      <CardTitle className="text-base">{note.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`${note.title} 수정`}
                        onClick={() =>
                          setEditState({
                            id: note.patch_note_id,
                            title: note.title,
                            body: note.body,
                          })
                        }
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`${note.title} 삭제`}
                        onClick={() => handleDelete(note)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  {note.body && (
                    <CardContent>
                      <div className="prose prose-sm max-w-none text-sm">
                        <ReactMarkdown>{note.body}</ReactMarkdown>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Edit dialog */}
      <Dialog
        open={editState !== null}
        onOpenChange={open => !open && setEditState(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>패치노트 수정</DialogTitle>
          </DialogHeader>
          {editState && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">제목</Label>
                <Input
                  id="edit-title"
                  value={editState.title}
                  onChange={e =>
                    setEditState({ ...editState, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-body">본문 (Markdown)</Label>
                <textarea
                  id="edit-body"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editState.body}
                  onChange={e =>
                    setEditState({ ...editState, body: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditState(null)}
              type="button"
            >
              취소
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create dialog */}
      <Dialog
        open={createState !== null}
        onOpenChange={open => !open && setCreateState(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 패치노트</DialogTitle>
          </DialogHeader>
          {createState && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="create-date">날짜</Label>
                  <Input
                    id="create-date"
                    type="date"
                    value={createState.date}
                    onChange={e =>
                      setCreateState({ ...createState, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-scope">스코프</Label>
                  <select
                    id="create-scope"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={createState.scope}
                    onChange={e =>
                      setCreateState({
                        ...createState,
                        scope: e.target.value as PatchNoteScope,
                      })
                    }
                  >
                    {SCOPES.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-title">제목</Label>
                <Input
                  id="create-title"
                  value={createState.title}
                  onChange={e =>
                    setCreateState({ ...createState, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-body">본문 (Markdown)</Label>
                <textarea
                  id="create-body"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={createState.body}
                  onChange={e =>
                    setCreateState({ ...createState, body: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateState(null)}
              type="button"
            >
              취소
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !createState?.title}
            >
              {createMutation.isPending ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
