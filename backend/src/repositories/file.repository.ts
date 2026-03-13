import { eq } from 'drizzle-orm'
import { db } from '../db'
import {
  files, importantPointFiles,
  type File as FileRecord, type NewFile,
  type ImportantPointFile, type NewImportantPointFile,
} from '../models/file.model'

export const FileRepository = {
  async create(data: NewFile): Promise<FileRecord> {
    const result = await db.insert(files).values(data).returning()
    return result[0]
  },

  async findById(id: string): Promise<FileRecord | undefined> {
    const result = await db.select().from(files).where(eq(files.id, id)).limit(1)
    return result[0]
  },

  async linkToImportantPoint(importantPointId: string, fileId: string): Promise<ImportantPointFile> {
    const result = await db
      .insert(importantPointFiles)
      .values({ importantPointId, fileId })
      .returning()
    return result[0]
  },

  async findByImportantPoint(importantPointId: string): Promise<FileRecord[]> {
    const rows = await db
      .select({ file: files })
      .from(importantPointFiles)
      .innerJoin(files, eq(importantPointFiles.fileId, files.id))
      .where(eq(importantPointFiles.importantPointId, importantPointId))
    return rows.map((r) => r.file)
  },
}
