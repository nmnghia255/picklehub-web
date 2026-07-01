"use server"

import axios from "axios"

import { TournamentRefereeService } from "../api/referee-service"

export async function assignRefereeToMatchAction(
  tournamentId: string,
  matchId: string,
  refereeId: string,
  refereeName: string
) {
  try {
    const data = await TournamentRefereeService.assignMatchReferee(
      tournamentId,
      matchId,
      refereeId,
      refereeName
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to assign referee:", error)
    let errorMessage = "Failed to assign referee"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
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
    let errorMessage = "Failed to unassign referee"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}
