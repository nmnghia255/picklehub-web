import { getAuthenticatedAxios } from "@/lib/server-api"

import type { TournamentPrize, TournamentPrizeRequest } from "../types/prize"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const TournamentPrizeService = {
  addTournamentPrize: async (
    tournamentId: string,
    prize: TournamentPrizeRequest
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<TournamentPrize>>(
      `/api/tournaments/${tournamentId}/prizes`,
      prize
    )
    return unwrapApiResponse(response.data)
  },

  getAllPrizes: async (tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<TournamentPrize[]>>(
      `/api/tournaments/${tournamentId}/prizes`
    )
    return unwrapApiResponse(response.data)
  },

  getPrizeById: async (tournamentId: string, prizeId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<TournamentPrize>>(
      `/api/tournaments/${tournamentId}/prizes/${prizeId}`
    )
    return unwrapApiResponse(response.data)
  },

  deleteTournamentPrize: async (tournamentId: string, prizeId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<TournamentPrize>>(
      `/api/tournaments/${tournamentId}/prizes/${prizeId}`
    )
    return unwrapApiResponse(response.data)
  },

  updateTournamentPrize: async (
    tournamentId: string,
    prizeId: string,
    prize: TournamentPrizeRequest
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<ApiResponse<TournamentPrize>>(
      `/api/tournaments/${tournamentId}/prizes/${prizeId}`,
      prize
    )
    return unwrapApiResponse(response.data)
  },

  awardPrizeToTeam: async (
    tournamentId: string,
    prizeId: string,
    winnerTeamId: number | string | null
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<TournamentPrize>>(
      `/api/tournaments/${tournamentId}/prizes/${prizeId}/award`,
      { winnerTeamId }
    )
    return unwrapApiResponse(response.data)
  },

  bindPrizeToTeam: async (
    tournamentId: string,
    prizeId: string,
    teamId: string
  ) => {
    return TournamentPrizeService.awardPrizeToTeam(
      tournamentId,
      prizeId,
      teamId
    )
  },
}
