import axios from "axios"

import { getSession } from "./session"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""

export async function getAuthenticatedAxios() {
  const session = await getSession()

  if (!session.accessToken) {
    throw new Error("Not authenticated")
  }

  // Refresh token if it expires within the next 60 seconds
  // const now = Date.now()
  // if (
  //   session.accessTokenExpiresAt &&
  //   session.accessTokenExpiresAt < now + 60_000
  // ) {
  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
  //       refreshToken: session.refreshToken,
  //     })
  //     const { accessToken, expiresIn } = response.data
  //     session.accessToken = accessToken
  //     session.accessTokenExpiresAt = now + expiresIn * 1000
  //     await session.save()
  //   } catch {
  //     session.destroy()
  //     throw new Error("Session expired")
  //   }
  // }

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
  })
}
