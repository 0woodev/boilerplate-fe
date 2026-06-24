import { test, expect } from '@playwright/test'

// E2E for the PatchNote changelog feature, driven against the MSW dev server
// (playwright.config starts vite with VITE_USE_MSW=true). Dev has no auth, so
// the flow is: open app → view changelog → create → edit.
test('patch notes: view, create, edit', async ({ page }) => {
  // --- Land on home (/ redirects to /home), navigate to Patch Notes ---
  await page.goto('/')
  await page.getByRole('link', { name: 'Patch Notes' }).first().click()
  await expect(page.getByRole('heading', { name: 'Patch Notes', level: 1 })).toBeVisible()

  // Seeded backport notes render
  await expect(page.getByText('FE 풀스택 보일러플레이트 이식')).toBeVisible()
  await page.screenshot({ path: 'test-results/shots/01-list.png', fullPage: true })

  // --- Create a new note with both user and dev bodies ---
  await page.getByRole('button', { name: '새 노트' }).click()
  const createDialog = page.getByRole('dialog')
  await expect(createDialog.getByText('새 패치노트')).toBeVisible()
  await createDialog.locator('#create-title').fill('E2E 데모 노트')
  await createDialog
    .locator('#create-user-body')
    .fill('**사용자용** 데모 노트\n\n- 더 쉬워졌어요')
  await createDialog
    .locator('#create-dev-body')
    .fill('**개발자용** 데모 노트\n\n- `Playwright` 로 작성')
  await page.screenshot({ path: 'test-results/shots/02-create-dialog.png', fullPage: true })
  await createDialog.getByRole('button', { name: '생성' }).click()

  // Default (user) view shows the title and the user body.
  await expect(page.getByText('E2E 데모 노트')).toBeVisible()
  await expect(page.getByText('사용자용', { exact: false })).toBeVisible()
  await page.screenshot({ path: 'test-results/shots/03-after-create.png', fullPage: true })

  // --- Edit an existing note's title ---
  await page.getByRole('button', { name: 'E2E 데모 노트 수정' }).click()
  const editDialog = page.getByRole('dialog')
  await expect(editDialog.getByText('패치노트 수정')).toBeVisible()
  await editDialog.locator('#edit-title').fill('E2E 데모 노트 (수정됨)')
  await editDialog.getByRole('button', { name: '저장' }).click()

  await expect(page.getByText('E2E 데모 노트 (수정됨)')).toBeVisible()
  await page.screenshot({ path: 'test-results/shots/04-after-edit.png', fullPage: true })

  // --- Developer view via ?dev=true (hidden entry, no nav link) ---
  await page.goto('/patch-notes?dev=true')
  await expect(page.getByRole('heading', { name: 'Patch Notes', level: 1 })).toBeVisible()
  await expect(page.getByText('개발자용').first()).toBeVisible()
  // dev-only seeded note appears only in the developer view
  await expect(page.getByText('내부 인증 토큰 로테이션')).toBeVisible()
  await page.screenshot({ path: 'test-results/shots/05-dev-view.png', fullPage: true })
})
