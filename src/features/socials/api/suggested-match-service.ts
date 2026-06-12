import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CommitMatchBatchResponse,
  CommitMatchRequest,
  ListPlaySessionMatchesResponse,
  SuggestedMatchBatchResponse,
  SuggestedMatchRequest,
} from "../types/match"

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

export const MatchService = {
  suggestMatches: async (
    socialId: string,
    sessionId: string,
    payload: SuggestedMatchRequest
  ): Promise<SuggestedMatchBatchResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<SuggestedMatchBatchResponse>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/match-batches/suggest`,
      payload
    )
    return unwrapApiResponse(response.data)
  },

  commitMatchBatches: async (
    socialId: string,
    playSessionId: string,
    payload: CommitMatchRequest[]
  ): Promise<CommitMatchBatchResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<CommitMatchBatchResponse>>(
      `/api/events/socials/${socialId}/play-sessions/${playSessionId}/match-batches/commit`,
      { matches: payload }
    )
    return unwrapApiResponse(response.data)
  },

  listMatches: async (params: {
    page: number
    limit: number
    playSessionId: string
  }): Promise<ListPlaySessionMatchesResponse> => {
    const axios = await getAuthenticatedAxios()
    params.limit = 100
    const response = await axios.get<
      | ApiResponse<ListPlaySessionMatchesResponse>
      | ListPlaySessionMatchesResponse
    >(`/api/matches`, { params })
    return unwrapApiResponse(response.data)
  },

  confirmMatchResult: async (
    matchId: string,
    payload: {
      winner: string
      scoreA: number
      scoreB: number
      sets: number[][]
    }
  ) => {
    const axios = await getAuthenticatedAxios()
    const { winner, scoreA, scoreB, sets } = payload
    const response = await axios.patch(`/api/matches/${matchId}/confirm`, {
      winner,
      scoreA,
      scoreB,
      sets,
    })
    return unwrapApiResponse(response.data)
  },

  startMatch: async (matchId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch(`/api/matches/${matchId}/start`)
    return unwrapApiResponse(response.data)
  },
}
