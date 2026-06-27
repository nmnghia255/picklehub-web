"use server"

import axios from "axios"

import { TournamentCheckinService } from "../api/checkin-service"

export async function checkinPlayerAction(
  tournamentId: string,
  registrationId: string,
  player: "player1" | "player2"
) {
  try {
    const data = await TournamentCheckinService.checkin(
      tournamentId,
      registrationId,
      player
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to checkin player:", error)
    let errorMessage = "Failed to perform check-in"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function getCheckinsAction(tournamentId: string) {
  try {
    const data = await TournamentCheckinService.getCheckins(tournamentId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to fetch checkins:", error)
    let errorMessage = "Failed to fetch check-ins list"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}
