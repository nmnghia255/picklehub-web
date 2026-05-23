import axios from "axios"

import { getSession } from "./session"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""
const ACCESS_TOKEN_TTL_MS = 900_000

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
      accessToken = await refreshSessionAccessToken(session)
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
          accessToken = await refreshSessionAccessToken(session)

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
