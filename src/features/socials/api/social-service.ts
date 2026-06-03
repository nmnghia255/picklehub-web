import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CreateSocialResponse,
  DuplicateSessionRequest,
  LeaveSocialResponse,
  ListSocialResponse,
  SocialParticipant,
} from "../types/social"

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

export const SocialService = {
  listMySocials: async function (
    tab: string | null,
    role: string | null,
    page: number | null,
    limit: number | null
  ): Promise<ListSocialResponse[]> {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    if (tab) searchParams.set("tab", tab)
    if (role) searchParams.set("role", role)
    if (page !== null) searchParams.set("page", page.toString())
    if (limit !== null) searchParams.set("limit", limit.toString())

    const response = await axios.get<ApiResponse<ListSocialResponse[]>>(
      "/api/events/socials/my-schedule",
      { params: searchParams }
    )
    return unwrapApiResponse(response.data)
  },

  createSocial: async function (
    payload: unknown
  ): Promise<CreateSocialResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<CreateSocialResponse>>(
      "/api/events/socials",
      payload
    )
    return unwrapApiResponse(response.data)
  },

  discover: async function (
    params?: Record<string, unknown>
  ): Promise<ListSocialResponse[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<ListSocialResponse[]>>(
      "/api/events/socials/discover",
      { params }
    )
    return unwrapApiResponse(response.data)
  },

  listAll: async function (): Promise<ListSocialResponse[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<ListSocialResponse[]>>(
      "/api/events/socials/all"
    )
    return unwrapApiResponse(response.data)
  },

  getSocial: async function (id: string): Promise<ListSocialResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<ListSocialResponse>>(
      `/api/events/socials/${id}`
    )
    return unwrapApiResponse(response.data)
  },

  updateSocial: async function (
    id: string,
    payload: unknown
  ): Promise<CreateSocialResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<CreateSocialResponse>>(
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

  publishSocial: async function (id: string): Promise<CreateSocialResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<CreateSocialResponse>>(
      `/api/events/socials/${id}/publish`
    )
    return unwrapApiResponse(response.data)
  },

  duplicateSocial: async function (
    id: string,
    payload: DuplicateSessionRequest
  ): Promise<CreateSocialResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<CreateSocialResponse>>(
      `/api/events/socials/${id}/duplicate`,
      payload
    )
    return unwrapApiResponse(response.data)
  },

  listSocialParticipants: async function (
    socialId: string,
    status?: string
  ): Promise<SocialParticipant[]> {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    if (status) searchParams.set("status", status)

    const response = await axios.get<ApiResponse<SocialParticipant[]>>(
      `/api/events/socials/${socialId}/participants?${searchParams.toString()}`
    )
    return unwrapApiResponse(response.data)
  },

  joinSocial: async function (socialId: string): Promise<SocialParticipant> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<SocialParticipant>>(
      `/api/events/socials/${socialId}/join`
    )
    return unwrapApiResponse(response.data)
  },

  leaveSocial: async function (socialId: string): Promise<LeaveSocialResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<LeaveSocialResponse>>(
      `/api/events/socials/${socialId}/leave`
    )
    return unwrapApiResponse(response.data)
  },

  approveJoinRequest: async function (
    socialId: string,
    participantId: string
  ): Promise<SocialParticipant> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<SocialParticipant>>(
      `/api/events/socials/${socialId}/participants/${participantId}/approve`
    )
    return unwrapApiResponse(response.data)
  },

  kickParticipant: async function (
    socialId: string,
    participantId: string
  ): Promise<SocialParticipant> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<SocialParticipant>>(
      `/api/events/socials/${socialId}/participants/${participantId}/kick`
    )
    return unwrapApiResponse(response.data)
  },
}
