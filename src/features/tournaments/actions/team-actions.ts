"use server"

import axios from "axios"

import { TournamentTeamService } from "../api/teams-service"

export async function getTeamEventsAction(
  eventId: string,
  tournamentId: string
) {
  try {
    const data = await TournamentTeamService.getTeamEvents(
      eventId,
      tournamentId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to fetch team events:", error)
    let errorMessage = "An unknown error occurred"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}
