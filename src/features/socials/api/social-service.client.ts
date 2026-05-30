import type { PlaySession, Social } from "../types"

interface ApiResponse<T> {
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
  message?: string
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

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

async function callApi<T>(path: string, init?: RequestInit) {
  const url = path.startsWith("/") ? path : `/${path}`
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }

  const data = await res.json()
  return data as unknown as T
}

export const socialService = {
  discover: async function (params?: SocialListQuery): Promise<{ data: Social[]; meta?: any; message: string }>
  {
    const query = params
      ? "?" + new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])).toString()
      : ""

    const data = await callApi<ApiResponse<Social[]>>(`/api/proxy/events/socials/discover${query}`)
    return { data: unwrapApiResponse(data), meta: data.meta, message: data.message ?? "" }
  },

  listMySocials: async function (): Promise<{ data: Social[]; meta?: any; message: string }> {
    const data = await callApi<ApiResponse<Social[]>>(`/api/proxy/events/socials/my-schedule`)
    return { data: unwrapApiResponse(data), meta: data.meta, message: data.message ?? "" }
  },

  getSocial: async function (id: string): Promise<Social> {
    const data = await callApi<ApiResponse<Social>>(`/api/proxy/events/socials/${id}`)
    return unwrapApiResponse(data)
  },

  listPlaySessions: async function (socialId: string): Promise<PlaySession[]> {
    const data = await callApi<ApiResponse<PlaySession[]>>(`/api/proxy/events/socials/${socialId}/play-sessions`)
    return unwrapApiResponse(data)
  },

  createSocial: async function (payload: SocialCreatePayload): Promise<Social> {
    const data = await callApi<ApiResponse<Social>>(`/api/proxy/events/socials`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return unwrapApiResponse(data)
  },

  updateSocial: async function (id: string, payload: SocialUpdatePayload): Promise<Social> {
    const data = await callApi<ApiResponse<Social>>(`/api/proxy/events/socials/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return unwrapApiResponse(data)
  },

  deleteSocial: async function (id: string): Promise<{ message: string }> {
    const data = await callApi<ApiResponse<{ message: string }>>(`/api/proxy/events/socials/${id}`, {
      method: "DELETE",
    })
    return unwrapApiResponse(data)
  },

  // Minimal client implementations for play-session actions
  createPlaySession: async function (socialId: string, payload: unknown): Promise<PlaySession> {
    const data = await callApi<ApiResponse<PlaySession>>(`/api/proxy/events/socials/${socialId}/play-sessions`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return unwrapApiResponse(data)
  },

  getPlaySession: async function (socialId: string, sessionId: string): Promise<PlaySession> {
    const data = await callApi<ApiResponse<PlaySession>>(`/api/proxy/events/socials/${socialId}/play-sessions/${sessionId}`)
    return unwrapApiResponse(data)
  },

  updatePlaySession: async function (socialId: string, sessionId: string, payload: unknown): Promise<PlaySession> {
    const data = await callApi<ApiResponse<PlaySession>>(`/api/proxy/events/socials/${socialId}/play-sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return unwrapApiResponse(data)
  },

  deletePlaySession: async function (socialId: string, sessionId: string): Promise<{ message: string }> {
    const data = await callApi<ApiResponse<{ message: string }>>(`/api/proxy/events/socials/${socialId}/play-sessions/${sessionId}`, {
      method: "DELETE",
    })
    return unwrapApiResponse(data)
  },
}

export default socialService
