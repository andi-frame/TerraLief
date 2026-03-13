import { RouteRepository } from '../repositories/route.repository'
import { ShelterRepository } from '../repositories/shelter.repository'
import { NotFoundException, ForbiddenException } from '../exceptions/http-exceptions'
import type { CreateRouteInput } from '../schemas/route.schema'

export const RouteService = {
  async listRoutes() {
    return RouteRepository.findAll()
  },

  async getRoute(id: string) {
    const route = await RouteRepository.findById(id)
    if (!route) throw new NotFoundException('Route not found')

    const [points, importantPoints] = await Promise.all([
      RouteRepository.findPoints(id),
      RouteRepository.findImportantPoints(id),
    ])

    return { ...route, points, importantPoints }
  },

  async createRoute(input: CreateRouteInput) {
    // Verify shelter exists
    const shelter = await ShelterRepository.findById(input.targetShelterId)
    if (!shelter) throw new NotFoundException('Target shelter not found')

    // Create route
    const route = await RouteRepository.create({
      startLat: input.startLat,
      startLng: input.startLng,
      targetShelterId: input.targetShelterId,
      name: input.name,
      distanceKm: input.distanceKm,
      etaMin: input.etaMin,
      vehicleType: input.vehicleType,
      isAiGenerated: input.isAiGenerated,
      summary: input.summary,
    })

    // Insert points and important points in parallel
    const [points, importantPoints] = await Promise.all([
      RouteRepository.insertPoints(
        input.points.map((p) => ({ routeId: route.id, ...p })),
      ),
      RouteRepository.insertImportantPoints(
        input.importantPoints.map((ip) => ({ routeId: route.id, ...ip })),
      ),
    ])

    return { ...route, points, importantPoints }
  },

  async deleteRoute(id: string, userId: string) {
    const route = await RouteRepository.findById(id)
    if (!route) throw new NotFoundException('Route not found')
    await RouteRepository.delete(id)
  },
}
