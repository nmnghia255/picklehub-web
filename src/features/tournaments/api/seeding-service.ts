import { getAuthenticatedAxios } from "@/lib/server-api"

import type { ReorderSeedsRequest, Seed } from "../types/seeding"

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

export const TournamentSeedingService = {
  generateSeedsEvent: async (tournamentId: number, eventId: number) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Seed[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/seeds/generate`
    )
    return unwrapApiResponse(response.data)
  },

  getEventSeeding: async (tournamentId: number, eventId: number) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Seed[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/seeds`
    )
    return unwrapApiResponse(response.data)
  },

  // Applies a full new seed ordering in one request (e.g. after a drag-and-drop).
  // The payload must include every seed exactly once. Blocked once seeding is locked.
  reorderSeeds: async (
    tournamentId: number,
    eventId: number,
    payload: ReorderSeedsRequest
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<Seed[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/seeds/reorder`,
      payload
    )
    return unwrapApiResponse(response.data)
  },

  lockSeedsEvent: async (tournamentId: number, eventId: number) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Seed[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/seeds/lock`
    )
    return unwrapApiResponse(response.data)
  },
}
