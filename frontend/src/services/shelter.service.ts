import { apiClient } from '../lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShelterPopulation {
  id: string
  shelterId: string
  male: number
  female: number
  children: number
  adults: number
  elderly: number
  medical: number
  mobility: number
  chronic: number
  pregnant: number
  infants: number
  updatedAt: string
}

export interface ShelterNeed {
  id: string
  shelterId: string
  item: string
  quantity: number
  fulfilled: number
  priority: 'high' | 'medium' | 'low'
  updatedAt: string
}

export interface ShelterCheckin {
  id: string
  shelterId: string
  name: string
  age: number | null
  condition: string | null
  createdAt: string
}

export interface Shelter {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  disasterType: string
  managedBy: string | null
  capacityStatus: string
  createdAt: string
  population: ShelterPopulation | null
  totalOccupants: number
}

export interface ShelterDetail extends Shelter {
  needs: ShelterNeed[]
}

export interface UpsertPopulationInput {
  male?: number
  female?: number
  children?: number
  adults?: number
  elderly?: number
  medical?: number
  mobility?: number
  chronic?: number
  pregnant?: number
  infants?: number
}

export interface CreateNeedInput {
  item: string
  quantity?: number
  fulfilled?: number
  priority?: 'high' | 'medium' | 'low'
}

export interface CreateCheckinInput {
  name: string
  age?: number
  condition?: string
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const shelterService = {
  async list(): Promise<Shelter[]> {
    const res = await apiClient.get<{ data: Shelter[] }>('/shelters')
    return res.data.data
  },

  async get(id: string): Promise<ShelterDetail> {
    const res = await apiClient.get<{ data: ShelterDetail }>(`/shelters/${id}`)
    return res.data.data
  },

  async create(input: {
    name: string
    address?: string
    lat: number
    lng: number
    disasterType: string
    managedBy?: string
    capacityStatus?: string
  }): Promise<Shelter> {
    const res = await apiClient.post<{ data: Shelter }>('/shelters', input)
    return res.data.data
  },

  async update(id: string, input: Partial<{
    name: string
    address: string
    lat: number
    lng: number
    disasterType: string
    managedBy: string
    capacityStatus: string
  }>): Promise<Shelter> {
    const res = await apiClient.put<{ data: Shelter }>(`/shelters/${id}`, input)
    return res.data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/shelters/${id}`)
  },

  async updatePopulation(shelterId: string, input: UpsertPopulationInput): Promise<ShelterPopulation> {
    const res = await apiClient.put<{ data: ShelterPopulation }>(`/shelters/${shelterId}/population`, input)
    return res.data.data
  },

  async listNeeds(shelterId: string): Promise<ShelterNeed[]> {
    const res = await apiClient.get<{ data: ShelterNeed[] }>(`/shelters/${shelterId}/needs`)
    return res.data.data
  },

  async addNeed(shelterId: string, input: CreateNeedInput): Promise<ShelterNeed> {
    const res = await apiClient.post<{ data: ShelterNeed }>(`/shelters/${shelterId}/needs`, input)
    return res.data.data
  },

  async updateNeed(shelterId: string, needId: string, input: Partial<CreateNeedInput>): Promise<ShelterNeed> {
    const res = await apiClient.put<{ data: ShelterNeed }>(`/shelters/${shelterId}/needs/${needId}`, input)
    return res.data.data
  },

  async deleteNeed(shelterId: string, needId: string): Promise<void> {
    await apiClient.delete(`/shelters/${shelterId}/needs/${needId}`)
  },

  async listCheckins(shelterId: string): Promise<ShelterCheckin[]> {
    const res = await apiClient.get<{ data: ShelterCheckin[] }>(`/shelters/${shelterId}/checkins`)
    return res.data.data
  },

  async addCheckin(shelterId: string, input: CreateCheckinInput): Promise<ShelterCheckin> {
    const res = await apiClient.post<{ data: ShelterCheckin }>(`/shelters/${shelterId}/checkins`, input)
    return res.data.data
  },
}
