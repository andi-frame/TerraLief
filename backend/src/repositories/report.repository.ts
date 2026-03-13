import { eq, desc } from 'drizzle-orm'
import { db } from '../db'
import { reports, type Report, type NewReport } from '../models/report.model'

export const ReportRepository = {
  async findAll(): Promise<Report[]> {
    return db.select().from(reports).orderBy(desc(reports.createdAt))
  },

  async findById(id: string): Promise<Report | undefined> {
    const result = await db.select().from(reports).where(eq(reports.id, id)).limit(1)
    return result[0]
  },

  async findByUser(userId: string): Promise<Report[]> {
    return db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt))
  },

  async create(data: NewReport): Promise<Report> {
    const result = await db.insert(reports).values(data).returning()
    return result[0]
  },

  async delete(id: string): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id))
  },
}
