import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CompletePlaySessionResponse,
  PlaySession,
  PlaySessionParticipant,
  PlaySessionRequest,
  StartPlaySessionResponse,
} from "../types/play-session"

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

export const PlaySessionService = {
  createPlaySession: async function (
    socialId: string,
    payload: PlaySessionRequest
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
    payload: Partial<PlaySessionRequest>
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

  startPlaySession: async function (
    socialId: string,
    sessionId: string
  ): Promise<StartPlaySessionResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<StartPlaySessionResponse>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/start`
    )
    return unwrapApiResponse(response.data)
  },

  completePlaySession: async function (
    socialId: string,
    sessionId: string
  ): Promise<CompletePlaySessionResponse> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<CompletePlaySessionResponse>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/complete`
    )
    return unwrapApiResponse(response.data)
  },

  listPlaySessionParticipants: async function (
    socialId: string,
    sessionId: string
  ): Promise<PlaySessionParticipant[]> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<PlaySessionParticipant[]>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/participants`
    )
    return unwrapApiResponse(response.data)
  },

  joinPlaySession: async function (
    socialId: string,
    sessionId: string
  ): Promise<PlaySessionParticipant> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<PlaySessionParticipant>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/join`
    )
    return unwrapApiResponse(response.data)
  },

  leavePlaySession: async function (
    socialId: string,
    sessionId: string
  ): Promise<PlaySessionParticipant> {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<PlaySessionParticipant>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/participants/me`
    )
    return unwrapApiResponse(response.data)
  },
}
