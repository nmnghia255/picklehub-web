import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  TournamentEvent,
  TournamentEventRequest,
  TournamentEventStanding,
} from "../types/tournament-event"

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

export const TournamentEventService = {
  createTournamentEvent: async (
    tournamentId: string,
    event: TournamentEventRequest
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<TournamentEvent>>(
      `/api/tournaments/${tournamentId}/events`,
      event
    )
    return unwrapApiResponse(response.data)
  },

  getTournamentEvents: async (tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<TournamentEvent[]>>(
      `/api/tournaments/${tournamentId}/events`
    )
    return unwrapApiResponse(response.data)
  },

  getTournamentEvent: async (tournamentId: string, eventId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<TournamentEvent>>(
      `/api/tournaments/${tournamentId}/events/${eventId}`
    )
    return unwrapApiResponse(response.data)
  },

  updateTournamentEvent: async (
    tournamentId: string,
    eventId: string,
    event: TournamentEventRequest
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.put<ApiResponse<TournamentEvent>>(
      `/api/tournaments/${tournamentId}/events/${eventId}`,
      event
    )
    return unwrapApiResponse(response.data)
  },

  deleteTournamentEvent: async (tournamentId: string, eventId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<null>>(
      `/api/tournaments/${tournamentId}/events/${eventId}`
    )
    return unwrapApiResponse(response.data)
  },

  // Final placement table for an event, derived from the bracket results (champion, runner-up, round eliminated, win/loss).
  getEventStandings: async (
    tournamentId: string,
    eventId: string
  ): Promise<TournamentEventStanding> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<TournamentEventStanding>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/standings`
    )
    return unwrapApiResponse(response.data)
  },
}
