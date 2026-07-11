import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  AcceptInvitationResponseDto,
  AssignedReferee,
  AssignRefereesResponseDto,
  InviteRefereeDto,
  InviteRefereeResponseDto,
  JoinTournamentResponseDto,
  Referee,
  RefereeInvitationItemDto,
  RefereeInvitationMetadataDto,
  RefereeRequest,
  RevokeInvitationResponseDto,
} from "../types/referee"

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
    refereeId: string
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<AssignedReferee>>(
      `/api/tournaments/${tournamentId}/matches/${matchId}/assign`,
      {
        refereeId,
      }
    )
    return unwrapApiResponse(response.data)
  },

  // Assigns an enrolled referee to a collection of matches in a single operation.
  assignMatchesReferee: async (
    tournamentId: string,
    matchIds: string[],
    refereeId: string
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<AssignedReferee[]>>(
      `/api/tournaments/${tournamentId}/referees/bulk-assign`,
      {
        matchIds,
        refereeId,
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
      `/api/tournaments/${tournamentId}/referees/assignments`,
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
      `/api/tournaments/${tournamentId}/referees/unassigned-matches`,
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
    const response = await axios.get<ApiResponse<AssignRefereesResponseDto>>(
      `/api/tournaments/${tournamentId}/referees/my-assignments`
    )
    return unwrapApiResponse(response.data)
  },

  // [Internal] Get referee invitation metadata by token
  getInternalInvitationByToken: async (token: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<RefereeInvitationMetadataDto>>(
      `/api/tournaments/internal/referees/invitations/${token}`
    )
    return unwrapApiResponse(response.data)
  },

  // [Internal] Accept referee invitation for a user
  acceptInternalInvitation: async (token: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<void>>(
      `/api/tournaments/internal/referees/invitations/${token}/accept`
    )
    return unwrapApiResponse(response.data)
  },

  // Accept a referee invitation
  acceptInvitation: async (token: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<AcceptInvitationResponseDto>>(
      `/api/referee-invitations/${token}/accept`
    )
    return unwrapApiResponse(response.data)
  },

  // Join tournament as referee after login
  joinTournament: async (token: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<JoinTournamentResponseDto>>(
      `/api/referee-invitations/${token}/join`
    )
    return unwrapApiResponse(response.data)
  },

  // Send a referee invitation
  inviteReferee: async (tournamentId: string, request: InviteRefereeDto) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post<ApiResponse<InviteRefereeResponseDto>>(
      `/api/tournaments/${tournamentId}/referees/invitations`,
      request
    )
    return unwrapApiResponse(response.data)
  },

  // List referee invitations
  listInvitations: async (tournamentId: string) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get<ApiResponse<RefereeInvitationItemDto[]>>(
      `/api/tournaments/${tournamentId}/referees/invitations`
    )
    return unwrapApiResponse(response.data)
  },

  // Revoke a referee invitation
  revokeInvitation: async (
    tournamentId: string,
    invitationId: string | number
  ) => {
    const axios = await getAuthenticatedAxios()
    const response = await axios.delete<
      ApiResponse<RevokeInvitationResponseDto>
    >(`/api/tournaments/${tournamentId}/referees/invitations/${invitationId}`)
    return unwrapApiResponse(response.data)
  },
}
