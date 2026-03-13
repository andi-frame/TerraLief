import { apiClient } from '../lib/axios'
import type { RouteDetail } from './route.service'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Report {
  id: string
  userId: string
  routeId: string
  isManualStart: boolean
  startLabel: string | null
  notes: string | null
  createdAt: string
}

export interface ReportDetail extends Report {
  route: RouteDetail
}

export interface CreateReportInput {
  routeId: string
  isManualStart?: boolean
  startLabel?: string
  notes?: string
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const reportService = {
  async list(): Promise<Report[]> {
    const res = await apiClient.get<{ data: Report[] }>('/reports')
    return res.data.data
  },

  async get(id: string): Promise<ReportDetail> {
    const res = await apiClient.get<{ data: ReportDetail }>(`/reports/${id}`)
    return res.data.data
  },

  async create(input: CreateReportInput): Promise<Report> {
    const res = await apiClient.post<{ data: Report }>('/reports', input)
    return res.data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/reports/${id}`)
  },
}
