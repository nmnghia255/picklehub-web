import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  AutoScheduleConfigDto,
  AutoSchedulePreviewResponse,
  TournamentSchedule,
  TournamentScheduleRequest,
} from "../types/schedule"

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

export const TournamentScheduleService = {
  // Links a fixture to a specific court+time slot (booking item) of a booking. Rejects if the slot is already used by another fixture.
  scheduleFixture: async (
    tournamentId: number,
    fixtureId: string,
    payload: TournamentScheduleRequest
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.patch<ApiResponse<TournamentSchedule>>(
      `/api/tournaments/${tournamentId}/fixtures/${fixtureId}/schedule`,
      payload
    )
    return unwrapApiResponse(response.data)
  },

  // Detaches the fixture from its booked slot (needed before removing its center).
  unlinkFixture: async (tournamentId: number, fixtureId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<TournamentSchedule>>(
      `/api/tournaments/${tournamentId}/fixtures/${fixtureId}/booking`
    )
    return unwrapApiResponse(response.data)
  },

  // Returns the tournament fixtures enriched to the FE Match shape (teams, court name + status, event, winner as 1/2),
  // plus a count of fixtures that still need a booking.
  getTournamentFixtures: async (tournamentId: number) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<TournamentSchedule[]>>(
      `/api/tournaments/${tournamentId}/schedule`
    )
    return unwrapApiResponse(response.data)
  },

  // Dry-runs the auto-scheduling algorithm in-memory to estimate expected completion time, scheduled matches count, and total courts used.
  previewAutoSchedule: async (
    tournamentId: number,
    eventId: number,
    payload: AutoScheduleConfigDto
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<AutoSchedulePreviewResponse>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/auto-schedule/preview`,
      payload
    )
    return unwrapApiResponse(response.data)
  },

  // Runs the auto-scheduling algorithm, persists match court/time slot assignments to the database, writes audit logs, and emails VĐVs.
  runAutoSchedule: async (
    tournamentId: number,
    eventId: number,
    payload: AutoScheduleConfigDto
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<AutoSchedulePreviewResponse>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/auto-schedule`,
      payload
    )
    return unwrapApiResponse(response.data)
  },
}
