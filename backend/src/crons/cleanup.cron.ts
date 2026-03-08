import { db } from '../db'
import { users } from '../models/user.model'
import { lt, and, isNull } from 'drizzle-orm'
import { logger } from '../core/logger'

const INACTIVE_DAYS = 30

/**
 * Cleanup job — removes inactive/stale accounts.
 * Runs every 24 hours.
 */
export function startCleanupCron(): void {
  const intervalMs = 24 * 60 * 60 * 1000 // 24 hours

  logger.info('Cleanup cron started — runs every 24h')

  const run = async () => {
    try {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - INACTIVE_DAYS)

      // Delete users with no refresh token (never logged in) created over 30 days ago
      const result = await db
        .delete(users)
        .where(and(isNull(users.refreshToken), lt(users.createdAt, cutoff)))
        .returning({ id: users.id })

      if (result.length > 0) {
        logger.info({ deleted: result.length }, 'Cleanup: removed stale accounts')
      }
    } catch (err) {
      logger.error({ err }, 'Cleanup cron error')
    }
  }

  // Run immediately on start, then on interval
  run()
  setInterval(run, intervalMs)
}
