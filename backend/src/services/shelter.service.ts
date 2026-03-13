import { ShelterRepository } from '../repositories/shelter.repository'
import { NotFoundException } from '../exceptions/http-exceptions'
import type {
  CreateShelterInput, UpdateShelterInput,
  UpsertPopulationInput, CreateNeedInput, UpdateNeedInput, CreateCheckinInput,
} from '../schemas/shelter.schema'

export const ShelterService = {
  async listShelters() {
    const shelterList = await ShelterRepository.findAll()
    const withPopulation = await Promise.all(
      shelterList.map(async (shelter) => {
        const pop = await ShelterRepository.findPopulation(shelter.id)
        const totalOccupants = pop
          ? pop.male + pop.female + pop.children + pop.elderly
          : 0
        return { ...shelter, population: pop ?? null, totalOccupants }
      }),
    )
    return withPopulation
  },

  async getShelter(id: string) {
    const shelter = await ShelterRepository.findById(id)
    if (!shelter) throw new NotFoundException('Shelter not found')

    const [population, needs] = await Promise.all([
      ShelterRepository.findPopulation(id),
      ShelterRepository.findNeeds(id),
    ])

    return { ...shelter, population: population ?? null, needs }
  },

  async createShelter(input: CreateShelterInput) {
    return ShelterRepository.create(input)
  },

  async updateShelter(id: string, input: UpdateShelterInput) {
    const shelter = await ShelterRepository.findById(id)
    if (!shelter) throw new NotFoundException('Shelter not found')
    const updated = await ShelterRepository.update(id, input)
    return updated!
  },

  async deleteShelter(id: string) {
    const shelter = await ShelterRepository.findById(id)
    if (!shelter) throw new NotFoundException('Shelter not found')
    await ShelterRepository.delete(id)
  },

  // ─── Population ────────────────────────────────────────────────────────────

  async updatePopulation(shelterId: string, input: UpsertPopulationInput) {
    const shelter = await ShelterRepository.findById(shelterId)
    if (!shelter) throw new NotFoundException('Shelter not found')
    return ShelterRepository.upsertPopulation(shelterId, input)
  },

  // ─── Needs ─────────────────────────────────────────────────────────────────

  async listNeeds(shelterId: string) {
    const shelter = await ShelterRepository.findById(shelterId)
    if (!shelter) throw new NotFoundException('Shelter not found')
    return ShelterRepository.findNeeds(shelterId)
  },

  async addNeed(shelterId: string, input: CreateNeedInput) {
    const shelter = await ShelterRepository.findById(shelterId)
    if (!shelter) throw new NotFoundException('Shelter not found')
    return ShelterRepository.createNeed({ shelterId, ...input })
  },

  async updateNeed(id: string, input: UpdateNeedInput) {
    const need = await ShelterRepository.findNeedById(id)
    if (!need) throw new NotFoundException('Need not found')
    const updated = await ShelterRepository.updateNeed(id, input)
    return updated!
  },

  async deleteNeed(id: string) {
    const need = await ShelterRepository.findNeedById(id)
    if (!need) throw new NotFoundException('Need not found')
    await ShelterRepository.deleteNeed(id)
  },

  // ─── Checkins ──────────────────────────────────────────────────────────────

  async listCheckins(shelterId: string) {
    const shelter = await ShelterRepository.findById(shelterId)
    if (!shelter) throw new NotFoundException('Shelter not found')
    return ShelterRepository.findCheckins(shelterId)
  },

  async addCheckin(shelterId: string, input: CreateCheckinInput) {
    const shelter = await ShelterRepository.findById(shelterId)
    if (!shelter) throw new NotFoundException('Shelter not found')
    return ShelterRepository.createCheckin({ shelterId, ...input })
  },
}
