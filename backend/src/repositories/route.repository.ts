import { eq, desc } from 'drizzle-orm'
import { db } from '../db'
import {
  routes, routePoints, importantPoints,
  type Route, type NewRoute,
  type RoutePoint, type NewRoutePoint,
  type ImportantPoint, type NewImportantPoint,
} from '../models/route.model'

export const RouteRepository = {
  async findAll(): Promise<Route[]> {
    return db.select().from(routes).orderBy(desc(routes.createdAt))
  },

  async findById(id: string): Promise<Route | undefined> {
    const result = await db.select().from(routes).where(eq(routes.id, id)).limit(1)
    return result[0]
  },

  async create(data: NewRoute): Promise<Route> {
    const result = await db.insert(routes).values(data).returning()
    return result[0]
  },

  async delete(id: string): Promise<void> {
    await db.delete(routes).where(eq(routes.id, id))
  },

  // ─── Points ──────────────────────────────────────────────────────────────────

  async findPoints(routeId: string): Promise<RoutePoint[]> {
    return db
      .select()
      .from(routePoints)
      .where(eq(routePoints.routeId, routeId))
      .orderBy(routePoints.pointOrder)
  },

  async insertPoints(data: NewRoutePoint[]): Promise<RoutePoint[]> {
    if (data.length === 0) return []
    return db.insert(routePoints).values(data).returning()
  },

  // ─── Important Points ────────────────────────────────────────────────────────

  async findImportantPoints(routeId: string): Promise<ImportantPoint[]> {
    return db
      .select()
      .from(importantPoints)
      .where(eq(importantPoints.routeId, routeId))
      .orderBy(importantPoints.createdAt)
  },

  async insertImportantPoints(data: NewImportantPoint[]): Promise<ImportantPoint[]> {
    if (data.length === 0) return []
    return db.insert(importantPoints).values(data).returning()
  },

  async findImportantPointById(id: string): Promise<ImportantPoint | undefined> {
    const result = await db
      .select()
      .from(importantPoints)
      .where(eq(importantPoints.id, id))
      .limit(1)
    return result[0]
  },
}
