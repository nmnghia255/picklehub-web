import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CreateSocialResponse,
  DuplicateSessionRequest,
  LeaveSocialResponse,
  ListSocial,
  ListSocialRequest,
  SocialDetail,
  SocialParticipant,
  UpdateSocialRequest,
} from "../types/social"

interface ApiResponse<T> {
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
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
  ): Promise<{
    data: ListSocial[]
    meta: ApiResponse<ListSocial[]>["meta"]
  }> {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    if (tab) searchParams.set("tab", tab)
    if (role) searchParams.set("role", role)
    if (page !== null) searchParams.set("page", page.toString())
    if (limit !== null) searchParams.set("limit", limit.toString())

    const response = await axios.get<ApiResponse<ListSocial[]>>(
      "/api/events/socials/my-schedule",
      { params: searchParams }
    )
    return { data: response.data.data, meta: response.data.meta }
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

  discover: async function (params: ListSocialRequest): Promise<{
    data: ListSocial[]
    meta: ApiResponse<ListSocial[]>["meta"]
  }> {
    const axios = await getAuthenticatedAxios()
    const searchParams = new URLSearchParams()
    if (params.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params.order) searchParams.set("order", params.order)
    if (params.page) searchParams.set("page", params.page.toString())
    if (params.limit) searchParams.set("limit", params.limit.toString())
    if (params.status) searchParams.set("status", params.status)
    if (params.search) searchParams.set("search", params.search)
    if (params.startFrom) searchParams.set("startFrom", params.startFrom)
    if (params.startTo) searchParams.set("startTo", params.startTo)
    if (params.upcoming)
      searchParams.set("upcoming", params.upcoming.toString())
    if (params.hasAvailableSlots)
      searchParams.set("hasAvailableSlots", params.hasAvailableSlots.toString())
    if (params.minimumLevel)
      searchParams.set("minimumLevel", params.minimumLevel.toString())
    if (params.maximumLevel)
      searchParams.set("maximumLevel", params.maximumLevel.toString())
    if (params.format) searchParams.set("format", params.format)
    if (params.genderPolicy)
      searchParams.set("genderPolicy", params.genderPolicy)
    if (params.ageGroup) searchParams.set("ageGroup", params.ageGroup)
    if (params.joinedOnly)
      searchParams.set("joinedOnly", params.joinedOnly.toString())

    const response = await axios.get<ApiResponse<ListSocial[]>>(
      "/api/events/socials/discover",
      { params: searchParams }
    )
    return { data: response.data.data, meta: response.data.meta }
  },

  listAll: async function (): Promise<ListSocial[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<ListSocial[]>>(
      "/api/events/socials/all"
    )
    return unwrapApiResponse(response.data)
  },

  getSocial: async function (id: string): Promise<SocialDetail> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<SocialDetail>>(
      `/api/events/socials/${id}`
    )
    return unwrapApiResponse(response.data)
  },

  updateSocial: async function (
    id: string,
    payload: UpdateSocialRequest
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

  joinSocial: async function (
    socialId: string,
    isFullPackage: boolean
  ): Promise<SocialParticipant> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<SocialParticipant>>(
      `/api/events/socials/${socialId}/join`,
      { isFullPackage }
    )
    return unwrapApiResponse(response.data)
  },

  leaveSocial: async function (socialId: string): Promise<LeaveSocialResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<LeaveSocialResponse>>(
      `/api/events/socials/${socialId}/participants/me`
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
      `/api/events/socials/${socialId}/participants/${participantId}`
    )
    return unwrapApiResponse(response.data)
  },

  completeSocial: async function (socialId: string) {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch(
      `/api/events/socials/${socialId}/complete`
    )
    return unwrapApiResponse(response.data)
  },
}
