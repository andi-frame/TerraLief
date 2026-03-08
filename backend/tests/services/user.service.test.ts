import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { UserService } from '../../src/services/user.service'
import { db } from '../../src/db'
import { users } from '../../src/models/user.model'
import { eq, inArray } from 'drizzle-orm'

const TEST_EMAILS = ['svc_reg@test.com', 'svc_login@test.com']

const cleanup = async () => {
  await db.delete(users).where(inArray(users.email, TEST_EMAILS))
}

// ─── Single outer beforeAll: cleanup + seed all test users ───────────────────
beforeAll(async () => {
  await cleanup()
  // Pre-create the login test user so no nested beforeAll is needed
  await UserService.register({
    username: 'svc_login_user',
    email: 'svc_login@test.com',
    password: 'Password1',
  })
})

afterAll(cleanup)

describe('UserService (integration)', () => {
  describe('register', () => {
    it('creates a new user and returns profile without passwordHash', async () => {
      const result = await UserService.register({
        username: 'svc_reg_user',
        email: 'svc_reg@test.com',
        password: 'Password1',
      })
      expect(result.username).toBe('svc_reg_user')
      expect(result.email).toBe('svc_reg@test.com')
      expect(result.id).toBeDefined()
      expect(result).not.toHaveProperty('passwordHash')
    })

    it('throws 409 if email is already in use', async () => {
      await expect(
        UserService.register({ username: 'other_user', email: 'svc_reg@test.com', password: 'Password1' })
      ).rejects.toMatchObject({ statusCode: 409 })
    })

    it('throws 409 if username is already taken', async () => {
      await expect(
        UserService.register({ username: 'svc_reg_user', email: 'other@test.com', password: 'Password1' })
      ).rejects.toMatchObject({ statusCode: 409 })
    })
  })

  describe('login', () => {
    it('throws 401 when user is not found', async () => {
      await expect(
        UserService.login({ email: 'nobody@test.com', password: 'Password1' })
      ).rejects.toMatchObject({ statusCode: 401 })
    })

    it('throws 401 on wrong password', async () => {
      await expect(
        UserService.login({ email: 'svc_login@test.com', password: 'WrongPass1' })
      ).rejects.toMatchObject({ statusCode: 401 })
    })

    it('returns tokens and profile on valid credentials', async () => {
      const result = await UserService.login({ email: 'svc_login@test.com', password: 'Password1' })
      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(result.user.email).toBe('svc_login@test.com')
    })
  })

  describe('logout', () => {
    it('throws 404 for non-existent user id', async () => {
      await expect(
        UserService.logout('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({ statusCode: 404 })
    })

    it('clears refresh token on valid user', async () => {
      await Bun.sleep(100)
      const [dbUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, 'svc_login@test.com'))
        .limit(1)
      const result = await UserService.logout(dbUser.id)
      expect(result).toBeUndefined()
    })
  })

  describe('getProfile', () => {
    it('throws 404 for non-existent user id', async () => {
      await expect(
        UserService.getProfile('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({ statusCode: 404 })
    })

    it('returns profile for existing user', async () => {
      const { user } = await UserService.login({ email: 'svc_login@test.com', password: 'Password1' })
      const profile = await UserService.getProfile(user.id)
      expect(profile.email).toBe('svc_login@test.com')
      expect(profile).not.toHaveProperty('passwordHash')
    })
  })
})
