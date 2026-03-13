import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { ShelterService } from '../services/shelter.service'
import {
  createShelterSchema, updateShelterSchema,
  upsertPopulationSchema, createNeedSchema, updateNeedSchema, createCheckinSchema,
} from '../schemas/shelter.schema'
import { authMiddleware } from '../middlewares/auth.middleware'

const shelter = new Hono()

// ─── Shelters ─────────────────────────────────────────────────────────────────

// GET /shelters — public list with totalOccupants
shelter.get('/', async (c) => {
  const data = await ShelterService.listShelters()
  return c.json({ success: true, data })
})

// GET /shelters/:id — public detail with population + needs
shelter.get('/:id', async (c) => {
  const data = await ShelterService.getShelter(c.req.param('id'))
  return c.json({ success: true, data })
})

// POST /shelters — auth required
shelter.post('/', authMiddleware, zValidator('json', createShelterSchema), async (c) => {
  const body = c.req.valid('json')
  const data = await ShelterService.createShelter(body)
  return c.json({ success: true, data }, 201)
})

// PUT /shelters/:id — auth required
shelter.put('/:id', authMiddleware, zValidator('json', updateShelterSchema), async (c) => {
  const body = c.req.valid('json')
  const data = await ShelterService.updateShelter(c.req.param('id'), body)
  return c.json({ success: true, data })
})

// DELETE /shelters/:id — auth required
shelter.delete('/:id', authMiddleware, async (c) => {
  await ShelterService.deleteShelter(c.req.param('id'))
  return c.json({ success: true, message: 'Shelter deleted' })
})

// ─── Population ───────────────────────────────────────────────────────────────

// PUT /shelters/:id/population — auth required
shelter.put('/:id/population', authMiddleware, zValidator('json', upsertPopulationSchema), async (c) => {
  const body = c.req.valid('json')
  const data = await ShelterService.updatePopulation(c.req.param('id'), body)
  return c.json({ success: true, data })
})

// ─── Needs ────────────────────────────────────────────────────────────────────

// GET /shelters/:id/needs — public
shelter.get('/:id/needs', async (c) => {
  const data = await ShelterService.listNeeds(c.req.param('id'))
  return c.json({ success: true, data })
})

// POST /shelters/:id/needs — auth required
shelter.post('/:id/needs', authMiddleware, zValidator('json', createNeedSchema), async (c) => {
  const body = c.req.valid('json')
  const data = await ShelterService.addNeed(c.req.param('id'), body)
  return c.json({ success: true, data }, 201)
})

// PUT /shelters/:id/needs/:nid — auth required
shelter.put('/:id/needs/:nid', authMiddleware, zValidator('json', updateNeedSchema), async (c) => {
  const body = c.req.valid('json')
  const data = await ShelterService.updateNeed(c.req.param('nid'), body)
  return c.json({ success: true, data })
})

// DELETE /shelters/:id/needs/:nid — auth required
shelter.delete('/:id/needs/:nid', authMiddleware, async (c) => {
  await ShelterService.deleteNeed(c.req.param('nid'))
  return c.json({ success: true, message: 'Need deleted' })
})

// ─── Checkins ─────────────────────────────────────────────────────────────────

// GET /shelters/:id/checkins — auth required (sensitive data)
shelter.get('/:id/checkins', async (c) => {
  const data = await ShelterService.listCheckins(c.req.param('id'))
  return c.json({ success: true, data })
})

// POST /shelters/:id/checkins — auth required
shelter.post('/:id/checkins', authMiddleware, zValidator('json', createCheckinSchema), async (c) => {
  const body = c.req.valid('json')
  const data = await ShelterService.addCheckin(c.req.param('id'), body)
  return c.json({ success: true, data }, 201)
})

export { shelter as shelterController }
