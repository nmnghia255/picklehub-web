"use server"

import axios from "axios"

import { TournamentEventService } from "../api/events-service"
import { TournamentPrizeService } from "../api/prizes-service"
import { TournamentService } from "../api/tournaments-service"
import type { TournamentPrizeRequest } from "../types/prize"
import type { TournamentRequest, TournamentStatus } from "../types/tournament"
import type { TournamentEventRequest } from "../types/tournament-event"

export interface CreateTournamentPayload {
  tournament: TournamentRequest
  events: (TournamentEventRequest & { localId: string | number })[]
  prizes: (Omit<TournamentPrizeRequest, "eventId"> & {
    localEventId: string | number
  })[]
}

export async function createFullTournamentAction(
  payload: CreateTournamentPayload
) {
  try {
    // 1. Create the tournament
    const tournament = await TournamentService.createTournament(
      payload.tournament
    )
    const tournamentId = tournament.id.toString()

    // 2. Create the events, and keep a map of localId -> backendId (normalizing keys to String)
    const eventIdMap = new Map<string, number>()
    for (const event of payload.events) {
      const { localId, ...eventData } = event
      const createdEvent = await TournamentEventService.createTournamentEvent(
        tournamentId,
        eventData
      )
      eventIdMap.set(String(localId), createdEvent.id)
    }

    // 3. Create the prizes, mapping localEventId -> backendEventId
    for (const prize of payload.prizes) {
      const { localEventId, ...prizeData } = prize
      const backendEventId = eventIdMap.get(String(localEventId))
      if (backendEventId === undefined) {
        throw new Error(
          `Event mapping not found for local event ID ${localEventId}`
        )
      }
      await TournamentPrizeService.addTournamentPrize(tournamentId, {
        ...prizeData,
        eventId: backendEventId,
      })
    }

    return { success: true, tournamentId }
  } catch (error: unknown) {
    console.error("Failed to create tournament with events and prizes:", error)
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

export async function getMyTournamentsAction(
  role: string,
  page: number,
  limit: number
) {
  try {
    const result = await TournamentService.getMyTournaments(
      role === "all" ? "" : role,
      page,
      limit
    )
    return {
      success: true as const,
      data: result.data,
      meta: result.meta,
    }
  } catch (error: unknown) {
    console.error("Failed to fetch my tournaments:", error)
    let errorMessage = "An unknown error occurred"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return {
      success: false as const,
      error: errorMessage,
    }
  }
}

export async function getTournamentsAction(
  search: string,
  status: string,
  page: number,
  limit: number
) {
  try {
    const result = await TournamentService.getTournaments(
      search,
      status === "all" ? "" : status,
      page,
      limit
    )
    return {
      success: true as const,
      data: result.data,
      meta: result.meta,
    }
  } catch (error: unknown) {
    console.error("Failed to fetch tournaments:", error)
    let errorMessage = "An unknown error occurred"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return {
      success: false as const,
      error: errorMessage,
    }
  }
}

export async function updateTournamentAction(
  id: string,
  payload: TournamentRequest
) {
  try {
    const updated = await TournamentService.updateTournament(id, payload)
    return { success: true as const, data: updated }
  } catch (error: unknown) {
    console.error("Failed to update tournament:", error)
    let errorMessage = "An unknown error occurred"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return {
      success: false as const,
      error: errorMessage,
    }
  }
}

export async function changeTournamentStatusAction(
  id: string,
  status: TournamentStatus
) {
  try {
    const updated = await TournamentService.changeTournamentStatus(id, status)
    return { success: true as const, data: updated }
  } catch (error: unknown) {
    console.error("Failed to change tournament status:", error)
    let errorMessage = "An unknown error occurred"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return {
      success: false as const,
      error: errorMessage,
    }
  }
}
