import "server-only"

import axios from "axios"

import { getSession } from "./session"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""
const ACCESS_TOKEN_TTL_MS = 900_000

// Deduplicates concurrent token refresh calls.
// When multiple Server Component requests fire simultaneously and all see a
// near-expiry token, only the first actually calls the auth API.
// The rest await this same promise and reuse the resulting access token,
// preventing the "thundering herd" that exhausts the single-use refresh token.
let refreshPromise: Promise<string> | null = null

async function refreshSessionAccessToken(
  session: Awaited<ReturnType<typeof getSession>>
) {
  if (!session.refreshToken) {
    throw new Error("Session expired")
  }

  const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
    refreshToken: session.refreshToken,
  })

  const { accessToken: refreshedAccessToken, expiresIn } = response.data as {
    accessToken: string
    expiresIn?: number
  }

  session.accessToken = refreshedAccessToken
  session.accessTokenExpiresAt = Date.now() + (expiresIn ?? 900) * 1000

  try {
    await session.save()
  } catch {
    // Server Components cannot write cookies, so keep the refreshed token
    // in-memory for the current request and skip persistence here.
  }

  return refreshedAccessToken
}

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
  const accessTokenExpiresAt =
    session.accessTokenExpiresAt ?? now + ACCESS_TOKEN_TTL_MS
  const shouldRefresh =
    !!session.refreshToken && accessTokenExpiresAt < now + 60_000

  if (shouldRefresh) {
    try {
      // If a refresh is already in-flight (e.g. from another parallel request
      // on the same page load), reuse that promise instead of firing a new one.
      // This ensures only one call to /api/auth/refresh is made at a time.
      if (!refreshPromise) {
        refreshPromise = refreshSessionAccessToken(session).finally(() => {
          refreshPromise = null
        })
      }
      accessToken = await refreshPromise
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
          // Also deduplicate retry-triggered refreshes
          if (!refreshPromise) {
            refreshPromise = refreshSessionAccessToken(session).finally(() => {
              refreshPromise = null
            })
          }
          accessToken = await refreshPromise

          originalConfig.headers = {
            ...originalConfig.headers,
            Authorization: `Bearer ${accessToken}`,
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
