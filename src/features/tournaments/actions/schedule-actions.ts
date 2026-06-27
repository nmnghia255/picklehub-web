"use server"

import axios from "axios"

import { TournamentScheduleService } from "../api/schedule-service"
import type {
  AutoScheduleConfigDto,
  FixtureResultRequest,
  TournamentScheduleRequest,
} from "../types/schedule"

export async function linkBookingItemToFixtureAction(
  tournamentId: number,
  fixtureId: string,
  payload: TournamentScheduleRequest
) {
  try {
    const data = await TournamentScheduleService.linkBookingItemToFixture(
      tournamentId,
      fixtureId,
      payload
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to link booking item:", error)
    let errorMessage = "Failed to link booking item to fixture"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function unlinkBookingItemFromFixtureAction(
  tournamentId: number,
  fixtureId: string
) {
  try {
    const data = await TournamentScheduleService.unlinkBookingItemFromFixture(
      tournamentId,
      fixtureId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to unlink booking item:", error)
    let errorMessage = "Failed to unlink booking item from fixture"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function getTournamentFixturesWithScheduleAction(
  tournamentId: number
) {
  try {
    const data =
      await TournamentScheduleService.getTournamentFixturesWithSchedule(
        tournamentId
      )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to fetch tournament fixtures with schedule:", error)
    let errorMessage = "Failed to load tournament fixtures"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function previewAutoScheduleAction(
  tournamentId: string | number,
  eventId: string | number,
  config: AutoScheduleConfigDto
) {
  try {
    const data = await TournamentScheduleService.previewAutoSchedule(
      tournamentId,
      eventId,
      config
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to preview auto-schedule:", error)
    let errorMessage = "Failed to preview auto-schedule"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function executeAutoScheduleAction(
  tournamentId: string | number,
  eventId: string | number,
  config: AutoScheduleConfigDto
) {
  try {
    const data = await TournamentScheduleService.executeAutoSchedule(
      tournamentId,
      eventId,
      config
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to execute auto-schedule:", error)
    let errorMessage = "Failed to execute auto-schedule"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function dispatchFixturesAction(
  tournamentId: string | number,
  eventId: string | number
) {
  try {
    const data = await TournamentScheduleService.dispatchFixtures(
      tournamentId,
      eventId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to dispatch fixtures:", error)
    let errorMessage = "Failed to dispatch fixtures"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function updateFixtureResultAction(
  tournamentId: string | number,
  fixtureId: string,
  result: FixtureResultRequest
) {
  try {
    const data = await TournamentScheduleService.updateFixtureResult(
      tournamentId,
      fixtureId,
      result
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to update fixture result:", error)
    let errorMessage = "Failed to update fixture result"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function syncFixturesAction(tournamentId: string | number) {
  try {
    const data = await TournamentScheduleService.syncFixtures(tournamentId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to sync fixtures:", error)
    let errorMessage = "Failed to sync fixtures"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}
