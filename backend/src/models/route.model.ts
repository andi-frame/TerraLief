import { pgTable, uuid, real, varchar, boolean, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { shelters } from './shelter.model'

// ─── Routes ───────────────────────────────────────────────────────────────────

export const routes = pgTable('routes', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Origin
  startLat: real('start_lat').notNull(),
  startLng: real('start_lng').notNull(),

  // Destination — FK to shelter
  targetShelterId: uuid('target_shelter_id')
    .notNull()
    .references(() => shelters.id, { onDelete: 'restrict' }),

  // Route metadata (displayed on RoutesPage route cards)
  name: varchar('name', { length: 100 }),    // e.g. "Route 1"
  distanceKm: real('distance_km'),
  etaMin: integer('eta_min'),
  vehicleType: varchar('vehicle_type', { length: 50 }),

  // AI / generation info
  isAiGenerated: boolean('is_ai_generated').notNull().default(false),
  summary: text('summary'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Route Points ─────────────────────────────────────────────────────────────
// Ordered lat/lng waypoints forming the polyline drawn by the user on the map.

export const routePoints = pgTable('route_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  routeId: uuid('route_id')
    .notNull()
    .references(() => routes.id, { onDelete: 'cascade' }),
  pointOrder: integer('point_order').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
})

// ─── Important Points ─────────────────────────────────────────────────────────
// Hazard/tip markers placed by volunteers on specific spots along the route.

export const importantPoints = pgTable('important_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  routeId: uuid('route_id')
    .notNull()
    .references(() => routes.id, { onDelete: 'cascade' }),

  lat: real('lat').notNull(),
  lng: real('lng').notNull(),

  // 'hazard' = blocked/damaged road | 'tip' = general advice | 'obstacle' = physical obstruction
  // Maps to frontend ReliefMarkerKind: 'hazard-point' | 'draft-point'
  category: varchar('category', { length: 50 }).notNull().default('tip'),

  message: text('message').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── DTO Types ────────────────────────────────────────────────────────────────

export type Route = typeof routes.$inferSelect
export type NewRoute = typeof routes.$inferInsert

export type RoutePoint = typeof routePoints.$inferSelect
export type NewRoutePoint = typeof routePoints.$inferInsert

export type ImportantPoint = typeof importantPoints.$inferSelect
export type NewImportantPoint = typeof importantPoints.$inferInsert
