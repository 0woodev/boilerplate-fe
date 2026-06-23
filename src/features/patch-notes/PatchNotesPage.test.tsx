import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createQueryClient } from '@/lib/queryClient'
import { PatchNotesPage } from './PatchNotesPage'

function renderPage(ui: ReactNode) {
  const client = createQueryClient()
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('PatchNotesPage (MSW-mocked)', () => {
  it('renders seeded patch notes with scope badge and markdown body', async () => {
    renderPage(<PatchNotesPage />)

    expect(
      await screen.findByText('FE 풀스택 보일러플레이트 이식'),
    ).toBeInTheDocument()
    expect(screen.getByText('로컬 DB 부트스트랩 추가')).toBeInTheDocument()
    expect(screen.getByText('CI 파이프라인 개선')).toBeInTheDocument()

    // markdown is rendered (bold strong element from **MSW**)
    expect(screen.getByText('MSW').tagName).toBe('STRONG')
  })

  it('edits a note title and body through the edit dialog', async () => {
    const user = userEvent.setup()
    renderPage(<PatchNotesPage />)

    await screen.findByText('FE 풀스택 보일러플레이트 이식')

    await user.click(
      screen.getByLabelText('FE 풀스택 보일러플레이트 이식 수정'),
    )

    const dialog = await screen.findByRole('dialog')
    const titleInput = within(dialog).getByLabelText('제목')
    const bodyInput = within(dialog).getByLabelText('본문 (Markdown)')

    await user.clear(titleInput)
    await user.type(titleInput, '수정된 제목입니다')
    await user.clear(bodyInput)
    await user.type(bodyInput, '새 본문 내용')

    await user.click(within(dialog).getByRole('button', { name: '저장' }))

    await waitFor(() =>
      expect(screen.getByText('수정된 제목입니다')).toBeInTheDocument(),
    )
    expect(screen.getByText('새 본문 내용')).toBeInTheDocument()
    expect(
      screen.queryByText('FE 풀스택 보일러플레이트 이식'),
    ).not.toBeInTheDocument()
  })
})
