import { join, extname } from 'node:path'
import { mkdir } from 'node:fs/promises'
import { FileRepository } from '../repositories/file.repository'
import { RouteRepository } from '../repositories/route.repository'
import { NotFoundException, BadRequestException } from '../exceptions/http-exceptions'

const UPLOADS_DIR = join(import.meta.dir, '..', '..', 'uploads')
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export const FileService = {
  async uploadFile(file: File, userId: string, baseUrl: string) {
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new BadRequestException('Only JPEG, PNG, WebP and GIF images are allowed')
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('File size must be under 10 MB')
    }

    await mkdir(UPLOADS_DIR, { recursive: true })

    const ext = extname(file.name) || `.${file.type.split('/')[1]}`
    const filename = `${crypto.randomUUID()}${ext}`
    const filepath = join(UPLOADS_DIR, filename)

    await Bun.write(filepath, await file.arrayBuffer())

    const url = `${baseUrl}/uploads/${filename}`
    const record = await FileRepository.create({ url, uploadedBy: userId })
    return record
  },

  async getFileRecord(id: string) {
    const file = await FileRepository.findById(id)
    if (!file) throw new NotFoundException('File not found')
    return file
  },

  async listFilesByImportantPoint(importantPointId: string) {
    const ip = await RouteRepository.findImportantPointById(importantPointId)
    if (!ip) throw new NotFoundException('Important point not found')
    return FileRepository.findByImportantPoint(importantPointId)
  },

  async attachFileToImportantPoint(importantPointId: string, fileId: string) {
    const ip = await RouteRepository.findImportantPointById(importantPointId)
    if (!ip) throw new NotFoundException('Important point not found')

    const file = await FileRepository.findById(fileId)
    if (!file) throw new NotFoundException('File not found')

    return FileRepository.linkToImportantPoint(importantPointId, fileId)
  },
}
