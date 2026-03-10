import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users, type NewUser, type User } from '../models/user.model'

export const UserRepository = {
  async findByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
    return result[0]
  },

  async findByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1)
    return result[0]
  },

  async findById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return result[0]
  },

  async create(data: NewUser): Promise<User> {
    const result = await db.insert(users).values(data).returning()
    return result[0]
  },

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await db
      .update(users)
      .set({ refreshToken, updatedAt: new Date() })
      .where(eq(users.id, id))
  },

  async findByRefreshToken(refreshToken: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.refreshToken, refreshToken))
      .limit(1)
    return result[0]
  },
}
