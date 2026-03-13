import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request Interceptor — attach access token ────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response Interceptor — silent refresh on 401 ────────────────────────────
let isRefreshing = false
let refreshPromise: Promise<string> | null = null

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const originalRequest = error.config
    const status = error.response?.status

    // Only attempt refresh once; skip refresh endpoint itself to avoid loops
    if (
      status !== 401 ||
      !originalRequest ||
      (originalRequest as typeof originalRequest & { _retry?: boolean })._retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error)
    }

    ;(originalRequest as typeof originalRequest & { _retry?: boolean })._retry = true

    const { refreshToken, setTokens, clearAuth } = useAuthStore.getState()

    if (!refreshToken) {
      clearAuth()
      return Promise.reject(error)
    }

    // Deduplicate concurrent refresh calls
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = apiClient
        .post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
          '/auth/refresh',
          { refreshToken },
        )
        .then((res) => {
          const { accessToken, refreshToken: newRefresh } = res.data.data
          setTokens(accessToken, newRefresh)
          return accessToken
        })
        .catch((refreshError: unknown) => {
          clearAuth()
          return Promise.reject(refreshError)
        })
        .finally(() => {
          isRefreshing = false
          refreshPromise = null
        })
    }

    const newAccessToken = await refreshPromise
    if (newAccessToken && originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
    }
    return apiClient(originalRequest)
  },
)
