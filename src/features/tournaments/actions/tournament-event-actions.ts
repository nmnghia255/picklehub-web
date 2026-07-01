"use server"

import axios from "axios"

import { TournamentEventService } from "../api/events-service"
import { TournamentPrizeService } from "../api/prizes-service"
import type { TournamentPrizeRequest } from "../types/prize"
import type { TournamentEventRequest } from "../types/tournament-event"

export async function getTournamentEventsAction(tournamentId: string) {
  try {
    const data = await TournamentEventService.getTournamentEvents(tournamentId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to fetch tournament events:", error)
    let errorMessage = "An unknown error occurred"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function getTournamentEventAction(
  tournamentId: string,
  eventId: string
) {
  try {
    const data = await TournamentEventService.getTournamentEvent(
      tournamentId,
      eventId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to fetch tournament event:", error)
    let errorMessage = "An unknown error occurred"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function createTournamentEventAction(
  tournamentId: string,
  event: TournamentEventRequest
) {
  try {
    const data = await TournamentEventService.createTournamentEvent(
      tournamentId,
      event
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to create tournament event:", error)
    let errorMessage = "An unknown error occurred"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function updateTournamentEventAction(
  tournamentId: string,
  eventId: string,
  event: TournamentEventRequest
) {
  try {
    const data = await TournamentEventService.updateTournamentEvent(
      tournamentId,
      eventId,
      event
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to update tournament event:", error)
    let errorMessage = "An unknown error occurred"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function deleteTournamentEventAction(
  tournamentId: string,
  eventId: string
) {
  try {
    await TournamentEventService.deleteTournamentEvent(tournamentId, eventId)
    return { success: true }
  } catch (error: unknown) {
    console.error("Failed to delete tournament event:", error)
    let errorMessage = "An unknown error occurred"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function saveEventPrizesAction(
  tournamentId: string,
  eventId: number,
  newPrizes: Omit<TournamentPrizeRequest, "eventId">[]
) {
  try {
    // 1. Get all existing prizes for the tournament
    const allPrizes = await TournamentPrizeService.getAllPrizes(tournamentId)
    // 2. Filter existing prizes for this event
    const existingPrizes = allPrizes.filter(
      (p) => Number(p.eventId) === eventId
    )

    // 3. Delete existing prizes for this event
    for (const ep of existingPrizes) {
      await TournamentPrizeService.deleteTournamentPrize(
        tournamentId,
        String(ep.id)
      )
    }

    // 4. Create new prizes
    for (const np of newPrizes) {
      await TournamentPrizeService.addTournamentPrize(tournamentId, {
        ...np,
        eventId,
      })
    }

    return { success: true }
  } catch (error: unknown) {
    console.error("Failed to save event prizes:", error)
    let errorMessage = "An unknown error occurred"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return {
      success: false,
      error: errorMessage,
    }
  }
}
