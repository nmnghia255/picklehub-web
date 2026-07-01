import { getAuthenticatedAxios } from "@/lib/server-api"

import type { AssignedReferee, Referee, RefereeRequest } from "../types/referee"

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
  // Registers a referee user into the tournament roster so they can be assigned to matches.
  enrollReferee: async (tournamentId: string, request: RefereeRequest) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<Referee>>(
      `/api/tournaments/${tournamentId}/referees`,
      request
    )
    return unwrapApiResponse(response.data)
  },

  // Returns the roster of referees enrolled in this tournament, including match assignment counts.
  listReferees: async (tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<Referee[]>>(
      `/api/tournaments/${tournamentId}/referees`
    )
    return unwrapApiResponse(response.data)
  },

  // Unregisters a referee from the tournament roster. Fails if they have active assignments.
  unenrollReferee: async (tournamentId: string, refereeId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<void>>(
      `/api/tournaments/${tournamentId}/referees/${refereeId}`
    )
    return unwrapApiResponse(response.data)
  },

  // Enables tournament organizers to assign a specific referee to oversee a match.
  assignMatchReferee: async (
    tournamentId: string,
    matchId: string,
    refereeId: string,
    refereeName: string
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<AssignedReferee>>(
      `/api/tournaments/${tournamentId}/matches/${matchId}/assign`,
      {
        refereeId,
        refereeName,
      }
    )
    return unwrapApiResponse(response.data)
  },

  // Removes a referee assignment from a match.
  unassignMatchReferee: async (tournamentId: string, matchId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<ApiResponse<void>>(
      `/api/tournaments/${tournamentId}/matches/${matchId}/unassign`
    )
    return unwrapApiResponse(response.data)
  },

  // Retrieves all matches in the tournament with referee information, optionally filtered by event.
  listMatchesWithReferees: async (tournamentId: string, eventId?: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<AssignedReferee[]>>(
      `/api/tournaments/${tournamentId}/assignments`,
      {
        params: {
          eventId,
        },
      }
    )
    return unwrapApiResponse(response.data)
  },

  // Retrieves all matches in the tournament that do not have a referee assigned.
  listUnassignedMatches: async (tournamentId: string, eventId?: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<AssignedReferee[]>>(
      `/api/tournaments/${tournamentId}/matches/unassigned-matches`,
      {
        params: {
          eventId,
        },
      }
    )
    return unwrapApiResponse(response.data)
  },

  // Retrieves all matches assigned to the currently logged-in referee in this tournament.
  listMyMatches: async (tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<AssignedReferee[]>>(
      `/api/tournaments/${tournamentId}/referees/my-assignments`
    )
    return unwrapApiResponse(response.data)
  },
}
