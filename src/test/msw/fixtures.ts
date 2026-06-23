import type { PatchNote } from '@/hooks/usePatchNotes'

// In-memory patch-note store backing the MSW handlers. Seeded with a few
// backport-style entries so the UI and tests have realistic data. The store is
// mutated by the POST/PATCH/DELETE handlers and reset between tests via
// resetPatchNotes() (called from resetFixtures()).
function seed(): PatchNote[] {
  return [
    {
      patch_note_id: 'pn-001',
      date: '2026-06-20',
      scope: 'fe',
      title: 'FE 풀스택 보일러플레이트 이식',
      user_body:
        '- 새로운 화면을 더 빠르게 만들 수 있게 되었어요\n- **MSW** 덕분에 서버 없이도 미리 확인할 수 있어요',
      dev_body:
        '- shadcn UI + TanStack Query 기반 앱 셸 구성\n- **MSW** 목 레이어로 BE 없이 개발 가능',
      source: 'activity',
      created_at: '2026-06-20T09:00:00Z',
      updated_at: '2026-06-20T09:00:00Z',
    },
    {
      patch_note_id: 'pn-002',
      date: '2026-06-18',
      scope: 'be',
      title: '로컬 DB 부트스트랩 추가',
      user_body: '로컬 개발 환경을 한 번에 준비할 수 있게 되었습니다.',
      dev_body: '로컬 개발용 `DynamoDB Local` 시드 스크립트를 추가했습니다.',
      source: 'activity',
      created_at: '2026-06-18T11:30:00Z',
      updated_at: '2026-06-18T11:30:00Z',
    },
    {
      patch_note_id: 'pn-003',
      date: '2026-06-15',
      scope: 'infra',
      title: 'CI 파이프라인 개선',
      user_body: '배포가 더 빨라졌습니다.',
      dev_body: '',
      source: 'manual',
      created_at: '2026-06-15T08:00:00Z',
      updated_at: '2026-06-15T08:00:00Z',
    },
    {
      patch_note_id: 'pn-004',
      date: '2026-06-12',
      scope: 'be',
      title: '내부 인증 토큰 로테이션',
      user_body: '',
      dev_body:
        '내부 서비스 간 통신 토큰을 주기적으로 로테이션하도록 `token-rotation-job` 을 추가했습니다.',
      source: 'manual',
      created_at: '2026-06-12T07:00:00Z',
      updated_at: '2026-06-12T07:00:00Z',
    },
  ]
}

export let patchNotes: PatchNote[] = seed()

export function resetPatchNotes(): void {
  patchNotes = seed()
}
