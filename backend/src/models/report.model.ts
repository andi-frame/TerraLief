import { pgTable, uuid, varchar, boolean, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './user.model'
import { routes } from './route.model'

// ─── Reports ──────────────────────────────────────────────────────────────────
// Links a user to a route they drew. One report = one route submission.

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' }),

  routeId: uuid('route_id')
    .notNull()
    .references(() => routes.id, { onDelete: 'cascade' }),

  // Starting point details — captures whether user used GPS or typed a label (ReportRoad.tsx)
  isManualStart: boolean('is_manual_start').notNull().default(false),
  startLabel: varchar('start_label', { length: 255 }),

  // General tips/warnings from the "Any Tips or Warnings?" textarea in ReportRoad.tsx
  notes: text('notes'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── DTO Types ────────────────────────────────────────────────────────────────

export type Report = typeof reports.$inferSelect
export type NewReport = typeof reports.$inferInsert
