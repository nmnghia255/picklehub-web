"use server"

import axios from "axios"

import { getAuthenticatedAxios } from "@/lib/server-api"

import { TournamentScheduleService } from "../api/schedule-service"
import { TournamentCourtService } from "../api/tournament-court-service"
import type {
  AutoScheduleConfigDto,
  ConfirmAutoScheduleRequest,
  FixtureResultRequest,
  TournamentScheduleRequest,
} from "../types/schedule"

function unwrapApiResponse<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as { data: T }).data
  }
  return payload as T
}

export async function linkBookingItemToFixtureAction(
  tournamentId: number,
  fixtureId: string,
  payload: TournamentScheduleRequest
) {
  try {
    payload.matchDurationMinutes = 15
    const data = await TournamentScheduleService.scheduleFixture(
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
    const data = await TournamentScheduleService.unlinkFixture(
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
      await TournamentScheduleService.getTournamentFixtures(tournamentId)
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
      Number(tournamentId),
      Number(eventId),
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
    const previewData = await TournamentScheduleService.previewAutoSchedule(
      Number(tournamentId),
      Number(eventId),
      config
    )
    const data = await TournamentScheduleService.confirmAutoSchedule(
      Number(tournamentId),
      Number(eventId),
      { assignments: previewData.previewAssignments }
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

export async function confirmAutoScheduleAction(
  tournamentId: string | number,
  eventId: string | number,
  payload: ConfirmAutoScheduleRequest
) {
  try {
    const data = await TournamentScheduleService.confirmAutoSchedule(
      Number(tournamentId),
      Number(eventId),
      payload
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to confirm auto-schedule:", error)
    let errorMessage = "Failed to confirm auto-schedule"
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
    const axiosInstance = await getAuthenticatedAxios()
    const response = await axiosInstance.post(
      `/api/tournaments/${tournamentId}/fixtures/dispatch`,
      { eventId }
    )
    const data = unwrapApiResponse(response.data)
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
    const axiosInstance = await getAuthenticatedAxios()
    const response = await axiosInstance.post(
      `/api/tournaments/${tournamentId}/fixtures/${fixtureId}/result`,
      result
    )
    const data = unwrapApiResponse(response.data)
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
    const axiosInstance = await getAuthenticatedAxios()
    const response = await axiosInstance.post(
      `/api/tournaments/${tournamentId}/fixtures/sync`
    )
    const data = unwrapApiResponse(response.data)
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

export async function getAvailableCourtsAction(
  tournamentId: string | number,
  centerId: string,
  date: string
) {
  try {
    const data = await TournamentCourtService.getAvailableCourts(
      tournamentId.toString(),
      centerId,
      date
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to fetch available courts:", error)
    let errorMessage = "Failed to fetch available courts"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function getBookedSlotsAction(
  tournamentId: string | number,
  centerId: string,
  date: string
) {
  try {
    const data = await TournamentCourtService.getBookedSlots(
      tournamentId.toString(),
      centerId,
      date
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to fetch booked slots:", error)
    let errorMessage = "Failed to fetch booked slots"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}
