import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { RouteService } from '../services/route.service'
import { createRouteSchema } from '../schemas/route.schema'
import { authMiddleware } from '../middlewares/auth.middleware'
import type { TokenPayload } from '../core/auth'

type Variables = { user: TokenPayload }

const route = new Hono<{ Variables: Variables }>()

// GET /routes — public list
route.get('/', async (c) => {
  const data = await RouteService.listRoutes()
  return c.json({ success: true, data })
})

// GET /routes/:id — public detail with points + important_points
route.get('/:id', async (c) => {
  const data = await RouteService.getRoute(c.req.param('id'))
  return c.json({ success: true, data })
})

// POST /routes — auth required
route.post('/', authMiddleware, zValidator('json', createRouteSchema), async (c) => {
  const body = c.req.valid('json')
  const user = c.get('user')
  const data = await RouteService.createRoute(body)
  return c.json({ success: true, data }, 201)
})

// DELETE /routes/:id — auth required
route.delete('/:id', authMiddleware, async (c) => {
  const user = c.get('user')
  await RouteService.deleteRoute(c.req.param('id'), user.userId)
  return c.json({ success: true, message: 'Route deleted' })
})

export { route as routeController }
