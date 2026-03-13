import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { ReportService } from '../services/report.service'
import { createReportSchema } from '../schemas/report.schema'
import { authMiddleware } from '../middlewares/auth.middleware'
import type { TokenPayload } from '../core/auth'

type Variables = { user: TokenPayload }

const report = new Hono<{ Variables: Variables }>()

// GET /reports — public list
report.get('/', async (c) => {
  const data = await ReportService.listReports()
  return c.json({ success: true, data })
})

// GET /reports/:id — public detail with hydrated route
report.get('/:id', async (c) => {
  const data = await ReportService.getReport(c.req.param('id'))
  return c.json({ success: true, data })
})

// POST /reports — auth required
report.post('/', authMiddleware, zValidator('json', createReportSchema), async (c) => {
  const body = c.req.valid('json')
  const user = c.get('user')
  const data = await ReportService.createReport(user.userId, body)
  return c.json({ success: true, data }, 201)
})

// DELETE /reports/:id — auth required, own report only
report.delete('/:id', authMiddleware, async (c) => {
  const user = c.get('user')
  await ReportService.deleteReport(c.req.param('id'), user.userId)
  return c.json({ success: true, message: 'Report deleted' })
})

export { report as reportController }
