import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './user.model'
import { importantPoints } from './route.model'

// ─── Files ────────────────────────────────────────────────────────────────────
// Stores URLs of uploaded images (e.g. photos attached to important_points).

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),                         // public URL returned by object storage
  uploadedBy: uuid('uploaded_by')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Important Point Files (join table) ───────────────────────────────────────
// Many-to-many: an important point can have multiple photos,
// and the same file object could (theoretically) be reused.

export const importantPointFiles = pgTable('important_point_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  importantPointId: uuid('important_point_id')
    .notNull()
    .references(() => importantPoints.id, { onDelete: 'cascade' }),
  fileId: uuid('file_id')
    .notNull()
    .references(() => files.id, { onDelete: 'cascade' }),
})

export type File = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert
export type ImportantPointFile = typeof importantPointFiles.$inferSelect
export type NewImportantPointFile = typeof importantPointFiles.$inferInsert
