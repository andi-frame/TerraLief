import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export interface TokenPayload extends JWTPayload {
  userId: string
  email: string
  type: 'access' | 'refresh'
}

const getSecret = (raw: string) => new TextEncoder().encode(raw)

const accessSecret = getSecret(
  process.env.JWT_ACCESS_SECRET ?? 'fallback-access-secret-change-in-production'
)
const refreshSecret = getSecret(
  process.env.JWT_REFRESH_SECRET ?? 'fallback-refresh-secret-change-in-production'
)

const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m'
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'

export async function signAccessToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email, type: 'access' } satisfies Omit<TokenPayload, keyof JWTPayload>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(accessExpiresIn)
    .sign(accessSecret)
}

export async function signRefreshToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email, type: 'refresh' } satisfies Omit<TokenPayload, keyof JWTPayload>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(refreshExpiresIn)
    .sign(refreshSecret)
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, accessSecret)
  return payload as TokenPayload
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, refreshSecret)
  return payload as TokenPayload
}
