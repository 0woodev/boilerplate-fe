import { defineConfig } from '@playwright/test'

/**
 * E2E는 MSW 모드 dev 서버를 기동해서 실행한다 (실제 BE 불필요).
 * - VITE_USE_MSW=true 로 강제 (유저의 .env.local 설정 무시)
 * - 포트는 5174 를 사용해서 개발 중인 dev 서버(5173)와 충돌 회피
 * - reuseExistingServer: true → 로컬에서 여러 번 돌려도 재사용
 */
const PORT = 5174

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: `vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      VITE_USE_MSW: 'true',
      VITE_BE_URL: 'http://localhost:0',
      VITE_PROJECT_NAME: 'boilerplate-app-e2e',
    },
  },
})
