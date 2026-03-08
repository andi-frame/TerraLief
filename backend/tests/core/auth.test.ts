import { describe, it, expect } from 'bun:test'
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../src/core/auth'

describe('auth helpers', () => {
  const userId = 'user-uuid-1234'
  const email = 'test@example.com'

  it('signs and verifies an access token', async () => {
    const token = await signAccessToken(userId, email)
    expect(typeof token).toBe('string')

    const payload = await verifyAccessToken(token)
    expect(payload.userId).toBe(userId)
    expect(payload.email).toBe(email)
    expect(payload.type).toBe('access')
  })

  it('signs and verifies a refresh token', async () => {
    const token = await signRefreshToken(userId, email)
    expect(typeof token).toBe('string')

    const payload = await verifyRefreshToken(token)
    expect(payload.userId).toBe(userId)
    expect(payload.email).toBe(email)
    expect(payload.type).toBe('refresh')
  })

  it('throws when verifying an invalid access token', async () => {
    await expect(verifyAccessToken('invalid.token.here')).rejects.toThrow()
  })

  it('throws when verifying a refresh token with the wrong secret (as access)', async () => {
    const refreshToken = await signRefreshToken(userId, email)
    await expect(verifyAccessToken(refreshToken)).rejects.toThrow()
  })
})
