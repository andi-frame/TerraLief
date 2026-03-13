import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shelterService } from '../services/shelter.service'
import type { CreateNeedInput, CreateCheckinInput, UpsertPopulationInput } from '../services/shelter.service'

export const shelterKeys = {
  all: ['shelters'] as const,
  detail: (id: string) => ['shelters', id] as const,
  needs: (id: string) => ['shelters', id, 'needs'] as const,
  checkins: (id: string) => ['shelters', id, 'checkins'] as const,
}

export function useShelters() {
  return useQuery({
    queryKey: shelterKeys.all,
    queryFn: shelterService.list,
  })
}

export function useShelter(id: string) {
  return useQuery({
    queryKey: shelterKeys.detail(id),
    queryFn: () => shelterService.get(id),
    enabled: !!id,
  })
}

export function useShelterNeeds(shelterId: string) {
  return useQuery({
    queryKey: shelterKeys.needs(shelterId),
    queryFn: () => shelterService.listNeeds(shelterId),
    enabled: !!shelterId,
  })
}

export function useShelterCheckins(shelterId: string) {
  return useQuery({
    queryKey: shelterKeys.checkins(shelterId),
    queryFn: () => shelterService.listCheckins(shelterId),
    enabled: !!shelterId,
  })
}

export function useUpdatePopulation(shelterId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpsertPopulationInput) => shelterService.updatePopulation(shelterId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: shelterKeys.detail(shelterId) }),
  })
}

export function useAddNeed(shelterId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateNeedInput) => shelterService.addNeed(shelterId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: shelterKeys.needs(shelterId) }),
  })
}

export function useDeleteNeed(shelterId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (needId: string) => shelterService.deleteNeed(shelterId, needId),
    onSuccess: () => qc.invalidateQueries({ queryKey: shelterKeys.needs(shelterId) }),
  })
}

export function useAddCheckin(shelterId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCheckinInput) => shelterService.addCheckin(shelterId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: shelterKeys.checkins(shelterId) }),
  })
}
