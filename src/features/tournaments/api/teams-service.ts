import { getAuthenticatedAxios } from "@/lib/server-api"

import type { AutoMatchTeam, Team, UnmatchedTeam } from "../types/player"

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

export const TournamentTeamService = {
  getTeamEvents: async (eventId: string, tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Team[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/teams`
    )
    return unwrapApiResponse(response.data)
  },

  getUnmatchedTeams: async (eventId: string, tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<UnmatchedTeam[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/solo-registrations`
    )
    return unwrapApiResponse(response.data)
  },

  matchTeamsManually: async (
    eventId: string,
    tournamentId: string,
    registrationId1: string,
    registrationId2: string
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Team>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/teams/match-manual`,
      { registrationId1, registrationId2 }
    )
    return unwrapApiResponse(response.data)
  },

  matchTeamsAuto: async (eventId: string, tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<AutoMatchTeam>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/teams/auto-match`
    )
    return unwrapApiResponse(response.data)
  },
}
