import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { Hono } from 'hono'
import { userController } from '../../src/controllers/user.controller'
import { authMiddleware } from '../../src/middlewares/auth.middleware'
import { HttpException } from '../../src/exceptions/http-exceptions'
import { db } from '../../src/db'
import { users } from '../../src/models/user.model'
import { inArray } from 'drizzle-orm'

// ─── Local Hono app (mirrors index.ts routing) ────────────────────────────────
const app = new Hono()
app.route('/auth', userController)
app.use('/auth/logout', authMiddleware)
app.use('/auth/me', authMiddleware)
app.onError((err, c) => {
  if (err instanceof HttpException) {
    return c.json({ success: false, error: err.message }, err.statusCode as any)
  }
  return c.json({ success: false, error: 'Internal Server Error' }, 500)
})

const TEST_EMAILS = ['ctrl_reg@test.com', 'ctrl_login@test.com']

const cleanup = async () => {
  await db.delete(users).where(inArray(users.email, TEST_EMAILS))
}

beforeAll(cleanup)
afterAll(cleanup)

describe('userController (integration)', () => {
  describe('POST /auth/register', () => {
    it('returns 201 with user data on valid input', async () => {
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'ctrl_reg_user', email: 'ctrl_reg@test.com', password: 'Password1' }),
      })
      expect(res.status).toBe(201)
      const body = await res.json() as any
      expect(body.success).toBe(true)
      expect(body.data.email).toBe('ctrl_reg@test.com')
    })

    it('returns 400 on invalid email', async () => {
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'u', email: 'not-an-email', password: 'pass' }),
      })
      expect(res.status).toBe(400)
    })

    it('returns 409 on duplicate email', async () => {
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'other_ctrl', email: 'ctrl_reg@test.com', password: 'Password1' }),
      })
      expect(res.status).toBe(409)
    })
  })

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'ctrl_login_user', email: 'ctrl_login@test.com', password: 'Password1' }),
      })
    })

    it('returns 200 with tokens on valid credentials', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ctrl_login@test.com', password: 'Password1' }),
      })
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.data.accessToken).toBeDefined()
      expect(body.data.refreshToken).toBeDefined()
    })

    it('returns 400 on missing password', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ctrl_login@test.com' }),
      })
      expect(res.status).toBe(400)
    })

    it('returns 401 on wrong password', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ctrl_login@test.com', password: 'WrongPass1' }),
      })
      expect(res.status).toBe(401)
    })
  })

  describe('POST /auth/refresh', () => {
    it('returns 401 on invalid refresh token', async () => {
      const res = await app.request('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid-token' }),
      })
      expect(res.status).toBe(401)
    })

    it('returns 200 with new tokens on valid refresh token', async () => {
      const loginRes = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ctrl_login@test.com', password: 'Password1' }),
      })
      const { data } = await loginRes.json() as any
      const res = await app.request('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: data.refreshToken }),
      })
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.data.accessToken).toBeDefined()
    })
  })
})
