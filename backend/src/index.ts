import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { apiReference } from '@scalar/hono-api-reference'
import { userController } from './controllers/user.controller'
import { authMiddleware } from './middlewares/auth.middleware'
import { HttpException } from './exceptions/http-exceptions'
import { logger } from './core/logger'
import { openApiSpec } from './openapi'

const app = new Hono()

// ─── Global Middlewares ─────────────────────────────────────────────────────
app.use('*', cors())
app.use('*', honoLogger())

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ─── OpenAPI Spec & Scalar Docs ──────────────────────────────────────────────
app.get('/openapi.json', (c) => c.json(openApiSpec))
app.get('/docs', apiReference({ url: '/openapi.json' }))

// ─── Public Auth Routes ──────────────────────────────────────────────────────
app.route('/auth', userController)

// ─── Protected Auth Routes (require valid JWT) ───────────────────────────────
app.use('/auth/logout', authMiddleware)
app.use('/auth/me', authMiddleware)

// ─── Global Error Handler ────────────────────────────────────────────────────
app.onError((err, c) => {
  if (err instanceof HttpException) {
    return c.json(
      {
        success: false,
        error: err.message,
        ...(err.errors ? { errors: err.errors } : {}),
      },
      err.statusCode as Parameters<typeof c.json>[1]
    )
  }

  logger.error({ err }, 'Unhandled error')
  return c.json({ success: false, error: 'Internal Server Error' }, 500)
})

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ success: false, error: 'Route not found' }, 404))

// ─── Crons ───────────────────────────────────────────────────────────────────
// Removed as requested

// ─── Start Server ─────────────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 3001
logger.info(`Server running at http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
