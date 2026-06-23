import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { createQueryClient } from '@/lib/queryClient'
import { PatchNotesPage } from './PatchNotesPage'

function renderPage(ui: ReactNode, initialEntries: string[] = ['/patch-notes']) {
  const client = createQueryClient()
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('PatchNotesPage (MSW-mocked)', () => {
  it('renders user_body in the default view and hides notes with an empty user_body', async () => {
    renderPage(<PatchNotesPage />)

    expect(
      await screen.findByText('FE 풀스택 보일러플레이트 이식'),
    ).toBeInTheDocument()

    // user_body markdown is rendered (bold strong element from **MSW**)
    expect(screen.getByText('MSW').tagName).toBe('STRONG')

    // The dev-only note (empty user_body) is hidden in the default view.
    expect(
      screen.queryByText('내부 인증 토큰 로테이션'),
    ).not.toBeInTheDocument()
  })

  it('renders dev_body when ?dev=true and shows a developer indicator', async () => {
    renderPage(<PatchNotesPage />, ['/patch-notes?dev=true'])

    expect(await screen.findByText('개발자용')).toBeInTheDocument()

    // The dev-only note now appears (it has a dev_body).
    expect(
      await screen.findByText('내부 인증 토큰 로테이션'),
    ).toBeInTheDocument()

    // dev_body markdown is rendered (code element from `token-rotation-job`).
    expect(screen.getByText('token-rotation-job').tagName).toBe('CODE')
  })

  it('hides notes with an empty dev_body when ?dev=true', async () => {
    renderPage(<PatchNotesPage />, ['/patch-notes?dev=true'])

    await screen.findByText('개발자용')

    // pn-003 (CI 파이프라인 개선) has an empty dev_body → hidden in dev view.
    expect(screen.queryByText('CI 파이프라인 개선')).not.toBeInTheDocument()
  })

  it('edits a note updating both user_body and dev_body', async () => {
    const user = userEvent.setup()
    renderPage(<PatchNotesPage />)

    await screen.findByText('FE 풀스택 보일러플레이트 이식')

    await user.click(screen.getByLabelText('FE 풀스택 보일러플레이트 이식 수정'))

    const dialog = await screen.findByRole('dialog')
    const titleInput = within(dialog).getByLabelText('제목')
    const userBodyInput = within(dialog).getByLabelText('사용자용 본문 (Markdown)')
    const devBodyInput = within(dialog).getByLabelText('개발자용 본문 (Markdown)')

    await user.clear(titleInput)
    await user.type(titleInput, '수정된 제목입니다')
    await user.clear(userBodyInput)
    await user.type(userBodyInput, '새 사용자 본문')
    await user.clear(devBodyInput)
    await user.type(devBodyInput, '새 개발자 본문')

    await user.click(within(dialog).getByRole('button', { name: '저장' }))

    await waitFor(() =>
      expect(screen.getByText('수정된 제목입니다')).toBeInTheDocument(),
    )
    // default view shows the updated user_body
    expect(screen.getByText('새 사용자 본문')).toBeInTheDocument()
  })

  it('creates a note with both bodies and shows the user_body in the default view', async () => {
    const user = userEvent.setup()
    renderPage(<PatchNotesPage />)

    await screen.findByText('FE 풀스택 보일러플레이트 이식')

    await user.click(screen.getByRole('button', { name: /새 노트/ }))

    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('제목'), '새로 만든 노트')
    await user.type(
      within(dialog).getByLabelText('사용자용 본문 (Markdown)'),
      '사용자에게 보이는 내용',
    )
    await user.type(
      within(dialog).getByLabelText('개발자용 본문 (Markdown)'),
      '개발자에게 보이는 내용',
    )

    await user.click(within(dialog).getByRole('button', { name: '생성' }))

    await waitFor(() =>
      expect(screen.getByText('새로 만든 노트')).toBeInTheDocument(),
    )
    expect(screen.getByText('사용자에게 보이는 내용')).toBeInTheDocument()
  })
})
