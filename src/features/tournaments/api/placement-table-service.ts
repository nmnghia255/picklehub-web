import { getAuthenticatedAxios } from "@/lib/server-api"

import type { FinalPlacementTableResponse } from "../types/placement-table"

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

export const TournamentPlacementTableService = {
  getEventStandings: async (tournamentId: string, eventId: number) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<FinalPlacementTableResponse>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/standings`
    )
    return unwrapApiResponse(response.data)
  },
}
