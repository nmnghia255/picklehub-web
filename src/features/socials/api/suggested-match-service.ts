import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CommitMatchBatchResponse,
  CommitMatchRequest,
  CommitRoundDto,
  CompletePlaySessionResponse,
  ListPlaySessionMatchesResponse,
  PlaySessionRound,
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

  commitRound: async (
    socialId: string,
    sessionId: string,
    payload: CommitRoundDto
  ): Promise<PlaySessionRound> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<PlaySessionRound>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/rounds`,
      payload
    )
    return unwrapApiResponse(response.data)
  },

  startRound: async (
    socialId: string,
    sessionId: string,
    roundId: string
  ): Promise<PlaySessionRound> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<PlaySessionRound>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/rounds/${roundId}/start`
    )
    return unwrapApiResponse(response.data)
  },

  listRounds: async (
    socialId: string,
    sessionId: string
  ): Promise<PlaySessionRound[]> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<PlaySessionRound[]>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/rounds`
    )
    return unwrapApiResponse(response.data)
  },

  finishRound: async (
    socialId: string,
    sessionId: string,
    roundId: string
  ): Promise<PlaySessionRound> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<PlaySessionRound>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/rounds/${roundId}/finish`
    )
    return unwrapApiResponse(response.data)
  },

  completePlaySession: async (
    socialId: string,
    sessionId: string
  ): Promise<CompletePlaySessionResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<CompletePlaySessionResponse>>(
      `/api/events/socials/${socialId}/play-sessions/${sessionId}/complete`
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

    // Try starting the match first if it is still SCHEDULED
    try {
      await axios.patch(`/api/matches/${matchId}/start`)
    } catch {
      // Ignore if match is already started or live
    }

    const body: Record<string, unknown> = {
      scoreA: Number(scoreA) || 0,
      scoreB: Number(scoreB) || 0,
    }
    if (winner) {
      body.winner = winner
    }
    if (Array.isArray(sets) && sets.length > 0) {
      body.sets = sets
    }

    const response = await axios.patch(`/api/matches/${matchId}/confirm`, body)
    return unwrapApiResponse(response.data)
  },

  startMatch: async (matchId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch(`/api/matches/${matchId}/start`)
    return unwrapApiResponse(response.data)
  },
}
