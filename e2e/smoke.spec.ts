import { test, expect } from '@playwright/test'

test('app loads without errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', err => errors.push(err.message))

  await page.goto('/')
  await page.waitForTimeout(2000)

  // Page has content
  const body = await page.textContent('body')
  expect(body?.length).toBeGreaterThan(0)
  expect(errors).toHaveLength(0)
})
