import { getAuthenticatedAxios } from "@/lib/server-api"

import type { PlaySession, Social } from "../types"

interface ApiResponse<T> {
  meta: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
  message: string
  data: T
}

export interface SocialListQuery {
  page?: number
  limit?: number
  sortBy?: "createdAt" | "startTime"
  order?: "asc" | "desc"
  groupId?: string
  status?: "PUBLISHED" | "COMPLETED" | "CANCELLED"
  search?: string
  startFrom?: string
  startTo?: string
  upcoming?: boolean
  hasAvailableSlots?: boolean
  minimumLevel?: number
  maximumLevel?: number
  format?: "SOCIAL" | "SINGLES"
  genderPolicy?: "ANY" | "MALE_ONLY" | "FEMALE_ONLY" | "MIXED_ONLY"
  ageGroup?: "ANY" | "JUNIOR" | "ADULT" | "SENIOR"
}

export interface SocialCreatePayload {
  groupId?: string
  title: string
  note?: string
  startTime?: string
  endTime?: string
  format?: "SOCIAL" | "SINGLES"
  isPrivate?: boolean
  maxSlots?: number
  submitDupr?: boolean
  minimumLevel?: number
  maximumLevel?: number
  genderPolicy?: "ANY" | "MALE_ONLY" | "FEMALE_ONLY" | "MIXED_ONLY"
  ageGroup?: "ANY" | "JUNIOR" | "ADULT" | "SENIOR"
  hostRole?: "HOST_ONLY" | "HOST_AND_PLAY"
  cancellationFreezeHours?: number
  autoApproveJoinRequests?: boolean
  paymentQrUrl?: string
  paymentCode?: string
  paymentNote?: string
}

export interface SocialUpdatePayload extends Partial<SocialCreatePayload> {
  status?: "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED"
}

export interface ListResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
  message: string
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const socialService = {
  listMySocials: async function (): Promise<ListResponse<Social[]>> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ListResponse<Social[]>>(
      "/api/events/socials/my-schedule"
    )
    return response.data
  },
  createSocial: async function (payload: SocialCreatePayload): Promise<Social> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Social>>(
      "/api/events/socials",
      payload
    )
    return unwrapApiResponse(response.data)
  },
  discover: async function (params?: SocialListQuery): Promise<ListResponse<Social[]>> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ListResponse<Social[]>>(
      "/api/events/socials/discover",
      { params }
    )
    return response.data
  },
  listAll: async function (): Promise<ListResponse<Social[]>> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ListResponse<Social[]>>(
      "/api/events/socials/all"
    )
    return response.data
  },
  getSocial: async function (id: string): Promise<Social> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Social>>(
      `/api/events/socials/${id}`
    )
    return unwrapApiResponse(response.data)
  },
  updateSocial: async function (id: string, payload: SocialUpdatePayload): Promise<Social> {
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
  ): Promise<PlaySession> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<PlaySession>>(
      `/api/events/socials/${socialId}/play-sessions`,
      payload
    )
    return unwrapApiResponse(response.data)
  },
  listPlaySessions: async function (socialId: string): Promise<PlaySession[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<PlaySession[]>>(
      `/api/events/socials/${socialId}/play-sessions`
    )
    return unwrapApiResponse(response.data)
  },
  getPlaySession: async function (
    socialId: string,
    sessionId: string
  ): Promise<PlaySession> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<PlaySession>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}`
    )
    return unwrapApiResponse(response.data)
  },
  updatePlaySession: async function (
    socialId: string,
    sessionId: string,
    payload: unknown
  ): Promise<PlaySession> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<PlaySession>>(
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
  ): Promise<PlaySession> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<PlaySession>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/cancel`
    )
    return unwrapApiResponse(response.data)
  },
}
