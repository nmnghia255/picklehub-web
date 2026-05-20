import { getAuthenticatedAxios } from "@/lib/server-api"

import type { Social } from "../types"

interface ApiResponse<T> {
  meta: {
    total: number
    page: number
    limit: number
  }
  message: string
  data: T
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const socialService = {
  listMySocials: async function (): Promise<Social[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Social[]>>(
      "/api/events/socials/my-schedule"
    )
    return unwrapApiResponse(response.data)
  },
  createSocial: async function (payload: unknown): Promise<Social> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Social>>(
      "/api/events/socials",
      payload
    )
    return unwrapApiResponse(response.data)
  },
  discover: async function (
    params?: Record<string, unknown>
  ): Promise<Social[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Social[]>>(
      "/api/events/socials/discover",
      { params }
    )
    return unwrapApiResponse(response.data)
  },
  listAll: async function (): Promise<Social[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Social[]>>(
      "/api/events/socials/all"
    )
    return unwrapApiResponse(response.data)
  },
  getSocial: async function (id: string): Promise<Social> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Social>>(
      `/api/events/socials/${id}`
    )
    return unwrapApiResponse(response.data)
  },
  updateSocial: async function (id: string, payload: unknown): Promise<Social> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Social>>(
      `/api/events/socials/${id}`,
      payload
    )
    return unwrapApiResponse(response.data)
  },
  deleteSocial: async function (id: string): Promise<{ message: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<{ message: string }>>(
      `/api/events/socials/${id}`
    )
    return unwrapApiResponse(response.data)
  },
  publishSocial: async function (id: string): Promise<Social> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Social>>(
      `/api/events/socials/${id}/publish`
    )
    return unwrapApiResponse(response.data)
  },
  duplicateSocial: async function (
    id: string,
    payload: unknown
  ): Promise<Social> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Social>>(
      `/api/events/socials/${id}/duplicate`,
      payload
    )
    return unwrapApiResponse(response.data)
  },
  createPlaySession: async function (
    socialId: string,
    payload: unknown
  ): Promise<unknown> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<unknown>>(
      `/api/events/socials/${socialId}/play-sessions`,
      payload
    )
    return unwrapApiResponse(response.data)
  },
  listPlaySessions: async function (socialId: string): Promise<unknown[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<unknown[]>>(
      `/api/events/socials/${socialId}/play-sessions`
    )
    return unwrapApiResponse(response.data)
  },
  getPlaySession: async function (
    socialId: string,
    sessionId: string
  ): Promise<unknown> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<unknown>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}`
    )
    return unwrapApiResponse(response.data)
  },
  updatePlaySession: async function (
    socialId: string,
    sessionId: string,
    payload: unknown
  ): Promise<unknown> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<unknown>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}`,
      payload
    )
    return unwrapApiResponse(response.data)
  },
  deletePlaySession: async function (
    socialId: string,
    sessionId: string
  ): Promise<{ message: string }> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<{ message: string }>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}`
    )
    return unwrapApiResponse(response.data)
  },
  cancelPlaySession: async function (
    socialId: string,
    sessionId: string
  ): Promise<unknown> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<unknown>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/cancel`
    )
    return unwrapApiResponse(response.data)
  },
}
