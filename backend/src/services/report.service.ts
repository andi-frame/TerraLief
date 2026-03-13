import { ReportRepository } from '../repositories/report.repository'
import { RouteRepository } from '../repositories/route.repository'
import { NotFoundException, ForbiddenException } from '../exceptions/http-exceptions'
import type { CreateReportInput } from '../schemas/report.schema'

export const ReportService = {
  async listReports() {
    return ReportRepository.findAll()
  },

  async getReport(id: string) {
    const report = await ReportRepository.findById(id)
    if (!report) throw new NotFoundException('Report not found')

    // Hydrate with route details
    const route = await RouteRepository.findById(report.routeId)
    if (!route) throw new NotFoundException('Route associated with report not found')

    const [points, importantPoints] = await Promise.all([
      RouteRepository.findPoints(route.id),
      RouteRepository.findImportantPoints(route.id),
    ])

    return { ...report, route: { ...route, points, importantPoints } }
  },

  async createReport(userId: string, input: CreateReportInput) {
    // Verify route exists
    const route = await RouteRepository.findById(input.routeId)
    if (!route) throw new NotFoundException('Route not found')

    return ReportRepository.create({ userId, ...input })
  },

  async deleteReport(id: string, userId: string) {
    const report = await ReportRepository.findById(id)
    if (!report) throw new NotFoundException('Report not found')
    if (report.userId !== userId) throw new ForbiddenException('You can only delete your own reports')
    await ReportRepository.delete(id)
  },
}
