import { getAuthenticatedAxios } from "@/lib/server-api"

import type { Bracket, EditBracketRequest } from "../types/bracket"

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

export const TournamentBracketService = {
  // Builds a seeded single-elimination bracket from the locked seeds (byes pad to the next power of two).
  // Requires the tournament to be in_progress and the seeds locked.
  generateEventBrackets: async (tournamentId: number, eventId: number) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Bracket[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/bracket/generate`
    )
    return unwrapApiResponse(response.data)
  },

  // Generates knockout brackets with anti-rematch/same-group separation rules from the new draw engine.
  generateKnockoutBracket: async (tournamentId: number, eventId: number) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Bracket[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/brackets/generate`
    )
    return unwrapApiResponse(response.data)
  },

  getEventBrackets: async (tournamentId: number, eventId: number) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Bracket[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/bracket`
    )
    return unwrapApiResponse(response.data)
  },

  // Removes the bracket so it can be regenerated. Blocked if any match has already started.
  deleteEventBrackets: async (tournamentId: number, eventId: number) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<void>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/bracket`
    )
    return unwrapApiResponse(response.data)
  },

  editEventBracket: async (
    tournamentId: number,
    eventId: number,
    payload: EditBracketRequest
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Bracket[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/bracket/edit`,
      payload
    )
    return unwrapApiResponse(response.data)
  },

  lockEventBracket: async (tournamentId: number, eventId: number) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<void>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/bracket/lock`
    )
    return unwrapApiResponse(response.data)
  },
}
