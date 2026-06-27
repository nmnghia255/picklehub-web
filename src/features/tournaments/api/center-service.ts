import { getAuthenticatedAxios } from "@/lib/server-api"

import type { TournamentCenter } from "../types/tournament-center"

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

export const TournamentCenterService = {
  getTournamentCenters: async (tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<TournamentCenter[]>>(
      `/api/tournaments/${tournamentId}/centers`
    )
    return unwrapApiResponse(response.data)
  },

  addTournamentCenter: async (tournamentId: string, centerIds: string[]) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<TournamentCenter[]>>(
      `/api/tournaments/${tournamentId}/centers`,
      { centerIds }
    )
    return unwrapApiResponse(response.data)
  },

  removeTournamentCenter: async (tournamentId: string, centerId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<TournamentCenter[]>>(
      `/api/tournaments/${tournamentId}/centers/${centerId}`
    )
    return unwrapApiResponse(response.data)
  },
}
