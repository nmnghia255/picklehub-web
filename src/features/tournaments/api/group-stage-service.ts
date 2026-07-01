import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  AdvanceTeamsRequest,
  AdvanceTeamsResponse,
  ConfigureGroupStageRequest,
  DrawGroupsRequest,
  GenerateMatchesResponse,
  Group,
} from "../types/group-stage"
import type { TournamentEvent } from "../types/tournament-event"

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

export const TournamentGroupStageService = {
  // Enables/disables group stage and sets groups & advancement configuration.
  configureGroupStage: async (
    tournamentId: number,
    eventId: number,
    payload: ConfigureGroupStageRequest
  ): Promise<TournamentEvent> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<TournamentEvent>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/group-stage/configure`,
      payload
    )
    return unwrapApiResponse(response.data)
  },

  // Shuffles locked seeds randomly and distributes them evenly to the configured groups.
  drawGroups: async (
    tournamentId: number,
    eventId: number,
    payload?: DrawGroupsRequest
  ): Promise<Group[]> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Group[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/group-stage/draw`,
      payload
    )
    return unwrapApiResponse(response.data)
  },

  // Retrieves all groups with their current standings ordered by rank.
  listGroups: async (
    tournamentId: number,
    eventId: number
  ): Promise<Group[]> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Group[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/group-stage/groups`
    )
    return unwrapApiResponse(response.data)
  },

  // Generates the round-robin matches for all drawn groups.
  // Deletes previous group stage matches if none have started.
  generateMatches: async (
    tournamentId: number,
    eventId: number
  ): Promise<GenerateMatchesResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<GenerateMatchesResponse>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/group-stage/generate-matches`
    )
    return unwrapApiResponse(response.data)
  },

  // Alias for /groups to retrieve standings details.
  getGroupStandings: async (
    tournamentId: number,
    eventId: number
  ): Promise<Group[]> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Group[]>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/group-stage/standings`
    )
    return unwrapApiResponse(response.data)
  },

  // Promotes the top teams and lucky losers from groups, seeds them sequentially, and prepares the event for the knockout stage.
  advanceTeams: async (
    tournamentId: number,
    eventId: number,
    payload: AdvanceTeamsRequest
  ): Promise<AdvanceTeamsResponse> => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<AdvanceTeamsResponse>>(
      `/api/tournaments/${tournamentId}/events/${eventId}/group-stage/advance`,
      payload
    )
    return unwrapApiResponse(response.data)
  },
}
