import { getAuthenticatedAxios } from "@/lib/server-api"

import type { Checkin } from "../types/checkin"

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

export const TournamentCheckinService = {
  checkin: async (
    tournamentId: string,
    registrationId: string,
    player: "player1" | "player2"
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Checkin>>(
      `/api/tournaments/${tournamentId}/registrations/${registrationId}/check-in`,
      { player }
    )
    return unwrapApiResponse(response.data)
  },

  getCheckins: async (tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Checkin[]>>(
      `/api/tournaments/${tournamentId}/check-ins`
    )
    return unwrapApiResponse(response.data)
  },
}
