import { apiClient } from '../lib/axios'

export interface AuthUser {
  id: string
  username: string
  email: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser
}

interface RegisterInput {
  username: string
  email: string
  password: string
}

interface LoginInput {
  email: string
  password: string
}

// Unwrap backend's { success, data } envelope
function unwrap<T>(response: { data: { success: boolean; data?: T; error?: string } }): T {
  const body = response.data
  if (!body.success || !body.data) {
    throw new Error(body.error ?? 'Request failed')
  }
  return body.data
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthUser> {
    const response = await apiClient.post<{ success: boolean; data?: AuthUser; error?: string }>(
      '/auth/register',
      input,
    )
    return unwrap(response)
  },

  async login(input: LoginInput): Promise<LoginResponse> {
    const response = await apiClient.post<{
      success: boolean
      data?: LoginResponse
      error?: string
    }>('/auth/login', input)
    return unwrap(response)
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<{
      success: boolean
      data?: AuthTokens
      error?: string
    }>('/auth/refresh', { refreshToken })
    return unwrap(response)
  },

  async getMe(): Promise<AuthUser> {
    const response = await apiClient.get<{ success: boolean; data?: AuthUser; error?: string }>(
      '/auth/me',
    )
    return unwrap(response)
  },
}
