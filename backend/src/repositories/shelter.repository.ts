import { eq, desc } from 'drizzle-orm'
import { db } from '../db'
import {
  shelters, shelterPopulations, shelterNeeds, shelterCheckins,
  type Shelter, type NewShelter,
  type ShelterPopulation, type NewShelterPopulation,
  type ShelterNeed, type NewShelterNeed,
  type ShelterCheckin, type NewShelterCheckin,
} from '../models/shelter.model'

export const ShelterRepository = {
  // ─── Shelters ────────────────────────────────────────────────────────────────

  async findAll(): Promise<Shelter[]> {
    return db.select().from(shelters).orderBy(desc(shelters.createdAt))
  },

  async findById(id: string): Promise<Shelter | undefined> {
    const result = await db.select().from(shelters).where(eq(shelters.id, id)).limit(1)
    return result[0]
  },

  async create(data: NewShelter): Promise<Shelter> {
    const result = await db.insert(shelters).values(data).returning()
    return result[0]
  },

  async update(id: string, data: Partial<NewShelter>): Promise<Shelter | undefined> {
    const result = await db.update(shelters).set(data).where(eq(shelters.id, id)).returning()
    return result[0]
  },

  async delete(id: string): Promise<void> {
    await db.delete(shelters).where(eq(shelters.id, id))
  },

  // ─── Population ──────────────────────────────────────────────────────────────

  async findPopulation(shelterId: string): Promise<ShelterPopulation | undefined> {
    const result = await db
      .select()
      .from(shelterPopulations)
      .where(eq(shelterPopulations.shelterId, shelterId))
      .limit(1)
    return result[0]
  },

  async upsertPopulation(
    shelterId: string,
    data: Omit<NewShelterPopulation, 'id' | 'shelterId'>,
  ): Promise<ShelterPopulation> {
    const existing = await this.findPopulation(shelterId)
    if (existing) {
      const result = await db
        .update(shelterPopulations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(shelterPopulations.shelterId, shelterId))
        .returning()
      return result[0]
    }
    const result = await db
      .insert(shelterPopulations)
      .values({ shelterId, ...data })
      .returning()
    return result[0]
  },

  // ─── Needs ───────────────────────────────────────────────────────────────────

  async findNeeds(shelterId: string): Promise<ShelterNeed[]> {
    return db
      .select()
      .from(shelterNeeds)
      .where(eq(shelterNeeds.shelterId, shelterId))
      .orderBy(desc(shelterNeeds.updatedAt))
  },

  async findNeedById(id: string): Promise<ShelterNeed | undefined> {
    const result = await db.select().from(shelterNeeds).where(eq(shelterNeeds.id, id)).limit(1)
    return result[0]
  },

  async createNeed(data: NewShelterNeed): Promise<ShelterNeed> {
    const result = await db.insert(shelterNeeds).values(data).returning()
    return result[0]
  },

  async updateNeed(id: string, data: Partial<NewShelterNeed>): Promise<ShelterNeed | undefined> {
    const result = await db
      .update(shelterNeeds)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shelterNeeds.id, id))
      .returning()
    return result[0]
  },

  async deleteNeed(id: string): Promise<void> {
    await db.delete(shelterNeeds).where(eq(shelterNeeds.id, id))
  },

  // ─── Checkins ────────────────────────────────────────────────────────────────

  async findCheckins(shelterId: string): Promise<ShelterCheckin[]> {
    return db
      .select()
      .from(shelterCheckins)
      .where(eq(shelterCheckins.shelterId, shelterId))
      .orderBy(desc(shelterCheckins.createdAt))
  },

  async createCheckin(data: NewShelterCheckin): Promise<ShelterCheckin> {
    const result = await db.insert(shelterCheckins).values(data).returning()
    return result[0]
  },
}
