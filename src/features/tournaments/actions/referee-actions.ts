"use server"

import axios from "axios"

import { getAuthenticatedAxios } from "@/lib/server-api"
import { getSession } from "@/lib/session"

import { TournamentMatchService } from "../api/match-service"
import { TournamentRefereeService } from "../api/referee-service"
import type {
  AcceptInvitationResponseDto,
  InviteRefereeDto,
  RefereeRequest,
} from "../types/referee"

export async function enrollRefereeAction(
  tournamentId: string,
  request: RefereeRequest
) {
  try {
    const data = await TournamentRefereeService.enrollReferee(
      tournamentId,
      request
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to enroll referee:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function listRefereesAction(tournamentId: string) {
  try {
    const data = await TournamentRefereeService.listReferees(tournamentId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to list referees:", error)
    let errorMessage = "Failed to list referees"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function unenrollRefereeAction(
  tournamentId: string,
  refereeId: string
) {
  try {
    await TournamentRefereeService.unenrollReferee(tournamentId, refereeId)
    return { success: true }
  } catch (error: unknown) {
    console.error("Failed to unenroll referee:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function listMatchesWithRefereesAction(
  tournamentId: string,
  eventId?: string
) {
  try {
    const data = await TournamentRefereeService.listMatchesWithReferees(
      tournamentId,
      eventId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to list matches with referees:", error)
    let errorMessage = "Failed to list matches with referees"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function listUnassignedMatchesAction(
  tournamentId: string,
  eventId?: string
) {
  try {
    const data = await TournamentRefereeService.listUnassignedMatches(
      tournamentId,
      eventId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to list unassigned matches:", error)
    let errorMessage = "Failed to list unassigned matches"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function assignRefereeToMatchAction(
  tournamentId: string,
  matchId: string,
  refereeId: string
) {
  try {
    const data = await TournamentRefereeService.assignMatchReferee(
      tournamentId,
      matchId,
      refereeId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to assign referee:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function unassignRefereeFromMatchAction(
  tournamentId: string,
  matchId: string
) {
  try {
    const data = await TournamentRefereeService.unassignMatchReferee(
      tournamentId,
      matchId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to unassign referee:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function listMyAssignmentsAction(tournamentId: string) {
  try {
    const data = await TournamentRefereeService.listMyMatches(tournamentId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to list my assignments:", error)
    let errorMessage = "Failed to list my assignments"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function bulkAssignRefereeAction(
  tournamentId: string,
  matchIds: string[],
  refereeId: string
) {
  try {
    const data = await TournamentRefereeService.assignMatchesReferee(
      tournamentId,
      matchIds,
      refereeId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to bulk assign referees:", error)
    let errorMessage = "Failed to bulk assign referees"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function inviteRefereeAction(
  tournamentId: string,
  request: InviteRefereeDto
) {
  try {
    const data = await TournamentRefereeService.inviteReferee(
      tournamentId,
      request
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to invite referee:", error)
    let errorMessage = "Failed to send invitation"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function listInvitationsAction(tournamentId: string) {
  try {
    const data = await TournamentRefereeService.listInvitations(tournamentId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to list invitations:", error)
    let errorMessage = "Failed to list invitations"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function revokeInvitationAction(
  tournamentId: string,
  invitationId: string | number
) {
  try {
    const data = await TournamentRefereeService.revokeInvitation(
      tournamentId,
      invitationId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to revoke invitation:", error)
    let errorMessage = "Failed to revoke invitation"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function searchUserByEmailAction(email: string) {
  try {
    const client = await getAuthenticatedAxios()
    const response = await client.get(`/api/friends/users/search`, {
      params: { q: email, limit: 10 },
    })
    const rawData = response.data
    const data = Array.isArray(rawData) ? rawData : rawData?.data || []

    const matchedUser = data.find(
      (u: {
        email?: string
        id: string
        name: string | null
        avatarUrl?: string
      }) => u.email?.toLowerCase() === email.trim().toLowerCase()
    )

    if (matchedUser) {
      return {
        success: true,
        user: {
          id: matchedUser.id,
          name: matchedUser.name,
          fullName: matchedUser.name,
          email: matchedUser.email,
          avatarUrl:
            matchedUser.avatarUrl ||
            `https://i.pravatar.cc/160?u=${encodeURIComponent(matchedUser.id)}`,
        },
      }
    }
    return { success: true, user: null }
  } catch (error: unknown) {
    console.error("Failed to search user by email:", error)
    let errorMessage = "Failed to search user"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export interface AcceptRefereeInvitationActionState {
  success?: boolean
  tournamentId?: number | string
  error?: string
}

export async function acceptRefereeInvitationAction(
  token: string
): Promise<AcceptRefereeInvitationActionState> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""
    const response = await axios.post(
      `${API_BASE_URL}/api/tournaments/referees/invitations/${token}/accept`
    )

    const rawData = response.data
    const data = (
      rawData &&
      typeof rawData === "object" &&
      "success" in rawData &&
      "data" in rawData
        ? (rawData as Record<string, unknown>).data
        : rawData
    ) as AcceptInvitationResponseDto

    console.log("acceptRefereeInvitationAction response data:", data)

    const userId = data?.userId?.id || ""
    const email = data?.userId?.email || ""
    const accessToken = data?.accessToken || ""
    const refreshToken = data?.refreshToken
    const tournamentId = data?.tournament?.id
    const expiresIn = data?.expiresIn

    if (accessToken) {
      const session = await getSession()
      session.user = { id: userId, email: email }
      session.accessToken = accessToken
      if (refreshToken) {
        session.refreshToken = refreshToken
      }
      session.accessTokenExpiresAt = Date.now() + (expiresIn ?? 900) * 1000
      await session.save()
    }

    return { success: true, tournamentId }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error:
          error.response?.data?.message ||
          "Failed to accept invitation. Please try again.",
      }
    }
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function startMatchAction(
  matchId: string,
  payload?: { firstServingPlayerId?: string }
) {
  try {
    const data = await TournamentMatchService.startMatch(matchId, payload)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to start match:", error)
    let errorMessage = "Failed to start match"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}
