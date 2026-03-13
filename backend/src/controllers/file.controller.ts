import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { FileService } from '../services/file.service'
import { authMiddleware } from '../middlewares/auth.middleware'
import type { TokenPayload } from '../core/auth'

type Variables = { user: TokenPayload }

const fileRouter = new Hono<{ Variables: Variables }>()

// ─── File Upload ──────────────────────────────────────────────────────────────

// POST /files/upload — multipart/form-data, auth required
fileRouter.post('/upload', authMiddleware, async (c) => {
  const user = c.get('user')
  const body = await c.req.parseBody()
  const file = body['file']

  if (!file || typeof file === 'string') {
    return c.json({ success: false, error: 'No file provided' }, 400)
  }

  // Build base URL from request
  const url = new URL(c.req.url)
  const baseUrl = `${url.protocol}//${url.host}`

  const data = await FileService.uploadFile(file as File, user.userId, baseUrl)
  return c.json({ success: true, data }, 201)
})

// GET /files/:id — get file record (not the binary — binary is served as static)
fileRouter.get('/:id', async (c) => {
  const data = await FileService.getFileRecord(c.req.param('id'))
  return c.json({ success: true, data })
})

// ─── Important Point Files ────────────────────────────────────────────────────

const attachSchema = z.object({ fileId: z.string().uuid() })

// GET /important-points/:id/files — public
fileRouter.get('/important-points/:id/files', async (c) => {
  const data = await FileService.listFilesByImportantPoint(c.req.param('id'))
  return c.json({ success: true, data })
})

// POST /important-points/:id/files — auth required
fileRouter.post(
  '/important-points/:id/files',
  authMiddleware,
  zValidator('json', attachSchema),
  async (c) => {
    const { fileId } = c.req.valid('json')
    const data = await FileService.attachFileToImportantPoint(c.req.param('id'), fileId)
    return c.json({ success: true, data }, 201)
  },
)

export { fileRouter as fileController }
