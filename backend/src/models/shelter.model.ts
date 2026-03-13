import { pgTable, uuid, varchar, real, integer, timestamp } from 'drizzle-orm/pg-core'

// ─── Shelters ─────────────────────────────────────────────────────────────────

export const shelters = pgTable('shelters', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  disasterType: varchar('disaster_type', { length: 50 }).notNull(), // 'flood' | 'landslide'
  managedBy: varchar('managed_by', { length: 255 }),
  capacityStatus: varchar('capacity_status', { length: 50 }).notNull().default('available'), // 'available' | 'limited' | 'full'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Shelter Populations ──────────────────────────────────────────────────────
// Tracks occupant breakdown for a shelter (shown in ShelterDetailsSheet — occupancy & age distribution).

export const shelterPopulations = pgTable('shelter_populations', {
  id: uuid('id').primaryKey().defaultRandom(),
  shelterId: uuid('shelter_id')
    .notNull()
    .references(() => shelters.id, { onDelete: 'cascade' }),
  male: integer('male').notNull().default(0),
  female: integer('female').notNull().default(0),
  children: integer('children').notNull().default(0), // age 0–14
  elderly: integer('elderly').notNull().default(0),   // age 65+
  medical: integer('medical').notNull().default(0),   // people requiring medical attention
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Shelter Needs ────────────────────────────────────────────────────────────
// One row per supply item needed at a shelter (shown in ShelterDetailsSheet — currentNeeds).

export const shelterNeeds = pgTable('shelter_needs', {
  id: uuid('id').primaryKey().defaultRandom(),
  shelterId: uuid('shelter_id')
    .notNull()
    .references(() => shelters.id, { onDelete: 'cascade' }),
  item: varchar('item', { length: 255 }).notNull(),       // e.g. "Clean Water", "Blankets"
  quantity: integer('quantity').notNull().default(0),     // total needed
  fulfilled: integer('fulfilled').notNull().default(0),   // amount already supplied
  priority: varchar('priority', { length: 20 }).notNull().default('medium'), // 'high' | 'medium' | 'low'
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Shelter Check-ins ────────────────────────────────────────────────────────
// Individual evacuee records for a shelter (for detailed health tracking).

export const shelterCheckins = pgTable('shelter_checkins', {
  id: uuid('id').primaryKey().defaultRandom(),
  shelterId: uuid('shelter_id')
    .notNull()
    .references(() => shelters.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  age: integer('age'),
  condition: varchar('condition', { length: 100 }), // e.g. 'healthy' | 'needs_medical' | 'critical'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── DTO Types ────────────────────────────────────────────────────────────────

export type Shelter = typeof shelters.$inferSelect
export type NewShelter = typeof shelters.$inferInsert

export type ShelterPopulation = typeof shelterPopulations.$inferSelect
export type NewShelterPopulation = typeof shelterPopulations.$inferInsert

export type ShelterNeed = typeof shelterNeeds.$inferSelect
export type NewShelterNeed = typeof shelterNeeds.$inferInsert

export type ShelterCheckin = typeof shelterCheckins.$inferSelect
export type NewShelterCheckin = typeof shelterCheckins.$inferInsert
