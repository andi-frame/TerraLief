import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportService } from '../services/report.service'
import type { CreateReportInput } from '../services/report.service'

export const reportKeys = {
  all: ['reports'] as const,
  detail: (id: string) => ['reports', id] as const,
}

export function useReports() {
  return useQuery({
    queryKey: reportKeys.all,
    queryFn: reportService.list,
  })
}

export function useCreateReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateReportInput) => reportService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.all }),
  })
}

export function useDeleteReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reportService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.all }),
  })
}
