import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { userController } from './controllers/user.controller'
import { shelterController } from './controllers/shelter.controller'
import { routeController } from './controllers/route.controller'
import { reportController } from './controllers/report.controller'
import { fileController } from './controllers/file.controller'
import { HttpException } from './exceptions/http-exceptions'
import { logger } from './core/logger'
import { openApiSpec } from './openapi'
import { apiReference } from '@scalar/hono-api-reference'

const app = new Hono()

// ─── Global Middlewares ─────────────────────────────────────────────────────
app.use('*', cors())
app.use('*', honoLogger())

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ─── Static File Serving (uploaded images) ───────────────────────────────────
app.use('/uploads/*', serveStatic({ root: './' }))

// ─── OpenAPI Spec & Scalar Docs ──────────────────────────────────────────────
app.get('/openapi.json', (c) => c.json(openApiSpec))
app.get('/docs', apiReference({ url: '/openapi.json' }))

// ─── Route Registrations ─────────────────────────────────────────────────────
// Auth middleware is applied inline per-route inside each controller
app.route('/auth', userController)
app.route('/shelters', shelterController)
app.route('/routes', routeController)
app.route('/reports', reportController)
app.route('/files', fileController)
app.route('/', fileController) // /important-points/:id/files sub-routes

// ─── Global Error Handler ────────────────────────────────────────────────────
app.onError((err, c) => {
  if (err instanceof HttpException) {
    return c.json(
      {
        success: false,
        error: err.message,
        ...(err.errors ? { errors: err.errors } : {}),
      },
      err.statusCode as Parameters<typeof c.json>[1],
    )
  }

  logger.error({ err }, 'Unhandled error')
  return c.json({ success: false, error: 'Internal Server Error' }, 500)
})

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ success: false, error: 'Route not found' }, 404))

// ─── Start Server ─────────────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 3001
logger.info(`Server running at http://localhost:${port}`)

export default {
  port,
  hostname: '0.0.0.0',
  fetch: app.fetch,
}
