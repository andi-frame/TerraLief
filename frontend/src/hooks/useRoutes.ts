import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routeService } from '../services/route.service'
import type { CreateRouteInput } from '../services/route.service'

export const routeKeys = {
  all: ['routes'] as const,
  detail: (id: string) => ['routes', id] as const,
}

export function useRoutes() {
  return useQuery({
    queryKey: routeKeys.all,
    queryFn: routeService.list,
  })
}

export function useRoute(id: string) {
  return useQuery({
    queryKey: routeKeys.detail(id),
    queryFn: () => routeService.get(id),
    enabled: !!id,
  })
}

export function useCreateRoute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRouteInput) => routeService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: routeKeys.all }),
  })
}

export function useDeleteRoute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => routeService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: routeKeys.all }),
  })
}
