import type { Context, MiddlewareHandler } from 'hono'
import { verifyAccessToken, type TokenPayload } from '../core/auth'
import { UnauthorizedException } from '../exceptions/http-exceptions'

declare module 'hono' {
  interface ContextVariableMap {
    user: TokenPayload
  }
}

export const authMiddleware: MiddlewareHandler = async (c: Context, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Missing or invalid Authorization header')
  }

  const token = authHeader.slice(7)

  const payload = await verifyAccessToken(token).catch(() => {
    throw new UnauthorizedException('Invalid or expired access token')
  })

  c.set('user', payload)
  await next()
}
