import { getAuthenticatedAxios } from "@/lib/server-api"

import type { AssignedReferee } from "../types/referee"

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

export const TournamentRefereeService = {
  assignRefereeToMatch: async (
    tournamentId: string,
    matchId: string,
    refereeId: string,
    refereeName: string
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<AssignedReferee>>(
      `/api/tournaments/${tournamentId}/matches/${matchId}/assign`,
      { refereeId, refereeName }
    )
    return unwrapApiResponse(response.data)
  },

  unassignRefereeFromMatch: async (tournamentId: string, matchId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<AssignedReferee>>(
      `/api/tournaments/${tournamentId}/matches/${matchId}/unassign`
    )
    return unwrapApiResponse(response.data)
  },

  getMyAssignments: async (tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<AssignedReferee[]>>(
      `/api/tournaments/${tournamentId}/referees/my-assignments`
    )
    return unwrapApiResponse(response.data)
  },
}
