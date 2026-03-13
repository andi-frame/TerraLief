import { apiClient } from '../lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoutePoint {
  id: string
  routeId: string
  pointOrder: number
  lat: number
  lng: number
}

export interface ImportantPoint {
  id: string
  routeId: string
  lat: number
  lng: number
  category: 'hazard' | 'tip' | 'obstacle'
  message: string
  createdAt: string
}

export interface Route {
  id: string
  startLat: number
  startLng: number
  targetShelterId: string
  name: string | null
  distanceKm: number | null
  etaMin: number | null
  vehicleType: string | null
  isAiGenerated: boolean
  summary: string | null
  createdAt: string
}

export interface RouteDetail extends Route {
  points: RoutePoint[]
  importantPoints: ImportantPoint[]
}

export interface CreateRouteInput {
  startLat: number
  startLng: number
  targetShelterId: string
  name?: string
  distanceKm?: number
  etaMin?: number
  vehicleType?: string
  isAiGenerated?: boolean
  summary?: string
  points: { pointOrder: number; lat: number; lng: number }[]
  importantPoints?: { lat: number; lng: number; category: 'hazard' | 'tip' | 'obstacle'; message: string }[]
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const routeService = {
  async list(): Promise<Route[]> {
    const res = await apiClient.get<{ data: Route[] }>('/routes')
    return res.data.data
  },

  async get(id: string): Promise<RouteDetail> {
    const res = await apiClient.get<{ data: RouteDetail }>(`/routes/${id}`)
    return res.data.data
  },

  async create(input: CreateRouteInput): Promise<RouteDetail> {
    const res = await apiClient.post<{ data: RouteDetail }>('/routes', input)
    return res.data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/routes/${id}`)
  },
}
