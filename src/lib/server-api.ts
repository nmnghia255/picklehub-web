import axios from "axios"

import { getSession } from "./session"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""

export async function getAuthenticatedAxios() {
  const session = await getSession()
  let accessToken = session.accessToken

  if (!accessToken) {
    throw new Error("Not authenticated")
  }

  // Refresh token when access token is near expiry.
  // Also refresh when expiry metadata is missing (older sessions),
  // which prevents stale tokens from being reused forever.
  const now = Date.now()
  const accessTokenExpiresAt = session.accessTokenExpiresAt ?? now + 15 * 60_000
  const shouldRefresh =
    !!session.refreshToken && accessTokenExpiresAt < now + 60_000

  if (shouldRefresh) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken: session.refreshToken,
      })
      const { accessToken: refreshedAccessToken } = response.data
      // Do not mutate cookies here. This helper is used in Server Components,
      // where cookie writes are forbidden. Keep refreshed token in-memory
      // for the current request only.
      accessToken = refreshedAccessToken
    } catch {
      throw new Error("Session expired")
    }
  }

  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalConfig = error?.config as
        | (typeof error.config & { _retry?: boolean })
        | undefined

      if (
        error?.response?.status === 401 &&
        originalConfig &&
        !originalConfig._retry &&
        session.refreshToken
      ) {
        originalConfig._retry = true

        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            { refreshToken: session.refreshToken }
          )

          const { accessToken: refreshedAccessToken } = refreshResponse.data
          accessToken = refreshedAccessToken

          originalConfig.headers = {
            ...originalConfig.headers,
            Authorization: `Bearer ${refreshedAccessToken}`,
          }

          return client.request(originalConfig)
        } catch {
          throw new Error("Session expired")
        }
      }

      return Promise.reject(error)
    }
  )

  return client
}
