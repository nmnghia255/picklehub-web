"use server"

import axios from "axios"

import { TournamentSeedingService } from "../api/seeding-service"
import type { ReorderSeedsRequest } from "../types/seeding"

export async function generateSeedsEventAction(
  tournamentId: number,
  eventId: number
) {
  try {
    const data = await TournamentSeedingService.generateSeedsEvent(
      tournamentId,
      eventId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to generate seeds:", error)
    let errorMessage = "Failed to generate seeds"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function getEventSeedingAction(
  tournamentId: number,
  eventId: number
) {
  try {
    const data = await TournamentSeedingService.getEventSeeding(
      tournamentId,
      eventId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to load seeding:", error)
    let errorMessage = "Failed to load seeding"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function reorderSeedsAction(
  tournamentId: number,
  eventId: number,
  payload: ReorderSeedsRequest
) {
  try {
    const data = await TournamentSeedingService.reorderSeeds(
      tournamentId,
      eventId,
      payload
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to reorder seeds:", error)
    let errorMessage = "Failed to reorder seeds"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function lockSeedsEventAction(
  tournamentId: number,
  eventId: number
) {
  try {
    const data = await TournamentSeedingService.lockSeedsEvent(
      tournamentId,
      eventId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to lock seeding:", error)
    let errorMessage = "Failed to lock seeding"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}
