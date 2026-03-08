import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { UserService } from '../services/user.service'
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/user.schema'
import { HttpException } from '../exceptions/http-exceptions'
import type { TokenPayload } from '../core/auth'

type Variables = {
  user: TokenPayload
}

const auth = new Hono<{ Variables: Variables }>()

// POST /auth/register
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json')
  const user = await UserService.register(body)
  return c.json({ success: true, data: user }, 201)
})

// POST /auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json')
  const result = await UserService.login(body)
  return c.json({ success: true, data: result })
})

// POST /auth/refresh
auth.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid('json')
  const tokens = await UserService.refreshToken(refreshToken)
  return c.json({ success: true, data: tokens })
})

// POST /auth/logout — requires auth middleware applied in index.ts
auth.post('/logout', async (c) => {
  const user = c.get('user')
  await UserService.logout(user.userId)
  return c.json({ success: true, message: 'Logged out successfully' })
})

// GET /auth/me — requires auth middleware applied in index.ts
auth.get('/me', async (c) => {
  const user = c.get('user')
  const profile = await UserService.getProfile(user.userId)
  return c.json({ success: true, data: profile })
})

export { auth as userController }
