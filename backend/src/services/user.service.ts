import { UserRepository } from '../repositories/user.repository'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../core/auth'
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '../exceptions/http-exceptions'
import type { RegisterInput, LoginInput } from '../schemas/user.schema'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface UserProfile {
  id: string
  username: string
  email: string
  createdAt: Date
}

export const UserService = {
  async register(input: RegisterInput): Promise<UserProfile> {
    const existingEmail = await UserRepository.findByEmail(input.email)
    if (existingEmail) throw new ConflictException('Email is already in use')

    const existingUsername = await UserRepository.findByUsername(input.username)
    if (existingUsername) throw new ConflictException('Username is already taken')

    const passwordHash = await Bun.password.hash(input.password, { algorithm: 'bcrypt', cost: 10 })
    const user = await UserRepository.create({ username: input.username, email: input.email, passwordHash })
    return { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt }
  },

  async login(input: LoginInput): Promise<AuthTokens & { user: UserProfile }> {
    const user = await UserRepository.findByEmail(input.email)
    if (!user) throw new UnauthorizedException('Invalid email or password')

    const isValid = await Bun.password.verify(input.password, user.passwordHash)
    if (!isValid) throw new UnauthorizedException('Invalid email or password')

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(user.id, user.email),
      signRefreshToken(user.id, user.email),
    ])
    await UserRepository.updateRefreshToken(user.id, refreshToken)

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt },
    }
  },

  async refreshToken(token: string): Promise<AuthTokens> {
    const payload = await verifyRefreshToken(token).catch(() => {
      throw new UnauthorizedException('Invalid or expired refresh token')
    })
    const user = await UserRepository.findByRefreshToken(token)
    if (!user || user.id !== payload.userId)
      throw new UnauthorizedException('Refresh token has been revoked')

    const [accessToken, newRefreshToken] = await Promise.all([
      signAccessToken(user.id, user.email),
      signRefreshToken(user.id, user.email),
    ])
    await UserRepository.updateRefreshToken(user.id, newRefreshToken)
    return { accessToken, refreshToken: newRefreshToken }
  },

  async logout(userId: string): Promise<void> {
    const user = await UserRepository.findById(userId)
    if (!user) throw new NotFoundException('User not found')
    await UserRepository.updateRefreshToken(userId, null)
  },

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await UserRepository.findById(userId)
    if (!user) throw new NotFoundException('User not found')
    return { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt }
  },
}
