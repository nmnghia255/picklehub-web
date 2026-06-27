import { getAuthenticatedAxios } from "@/lib/server-api"

import type { TournamentCourt } from "../types/tournament-court"

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

export const TournamentCourtService = {
  // Proxies sport-center bulk 30-minute court availability for a selected center on a date. The center must be in the tournament selection.
  getAvailableCourts: async (
    tournamentId: string,
    centerId: string,
    date: string
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<TournamentCourt[]>>(
      `/api/tournaments/${tournamentId}/courts/availability`,
      {
        params: {
          centerId,
          date,
        },
      }
    )
    return unwrapApiResponse(response.data)
  },
}
