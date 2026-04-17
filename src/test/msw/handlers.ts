/**
 * MSW 핸들러 — 도메인별 mock API 응답 정의.
 *
 * 사용처:
 *   - tests: tests/setup.ts 에서 msw server 구동 시 사용
 *   - browser dev: src/test/msw/browser.ts 에서 브라우저 모드 mock
 *
 * 핸들러 추가 예시:
 *   import { http, HttpResponse } from 'msw'
 *   handlers.push(
 *     http.get('/api/users', () => HttpResponse.json([{ id: 'u1', name: 'Alice' }]))
 *   )
 */
import { type RequestHandler } from 'msw'

export const handlers: RequestHandler[] = [
  // 도메인별 핸들러 추가
]
