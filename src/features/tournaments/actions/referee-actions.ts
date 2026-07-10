"use server"

import axios from "axios"

import { TournamentRefereeService } from "../api/referee-service"
import type { RefereeRequest } from "../types/referee"

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
