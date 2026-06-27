"use server"

import axios from "axios"

import { TournamentBracketService } from "../api/bracket-service"

export async function generateEventBracketsAction(
  tournamentId: number,
  eventId: number
) {
  try {
    const data = await TournamentBracketService.generateEventBrackets(
      tournamentId,
      eventId
    )
    return { success: true as const, data }
  } catch (error: unknown) {
    console.error("Failed to generate event brackets:", error)
    let errorMessage = "Failed to generate event brackets."
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false as const, error: errorMessage }
  }
}

export async function getEventBracketsAction(
  tournamentId: number,
  eventId: number
) {
  try {
    const data = await TournamentBracketService.getEventBrackets(
      tournamentId,
      eventId
    )
    return { success: true as const, data }
  } catch (error: unknown) {
    console.error("Failed to fetch event brackets:", error)
    let errorMessage = "Failed to fetch event brackets."
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false as const, error: errorMessage }
  }
}

export async function deleteEventBracketsAction(
  tournamentId: number,
  eventId: number
) {
  try {
    await TournamentBracketService.deleteEventBrackets(tournamentId, eventId)
    return { success: true as const }
  } catch (error: unknown) {
    console.error("Failed to delete event brackets:", error)
    let errorMessage = "Failed to delete event brackets."
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false as const, error: errorMessage }
  }
}
