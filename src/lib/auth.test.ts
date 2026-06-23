import { describe, it, expect } from 'vitest'
import { loginApi, registerApi } from './auth'

// Smoke test for the api wrapper + MSW + env stack.
// Serves as the template for feature tests; auth is a placeholder
// (X-Auth-User header) until real JWT bearer auth lands.
describe('auth api (MSW-mocked)', () => {
  it('loginApi resolves to the mocked user', async () => {
    const user = await loginApi('alice', 'pw')
    expect(user).toEqual({ userId: 'usr-dev-001', username: 'alice' })
  })

  it('registerApi echoes the username with a generated id', async () => {
    const user = await registerApi('bob', 'pw')
    expect(user.username).toBe('bob')
    expect(user.userId).toMatch(/^usr-/)
  })
})
