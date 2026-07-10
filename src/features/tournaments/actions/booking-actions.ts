"use server"

import axios from "axios"

import { listSportCenters } from "../../sport-center/api/sport-center-service"
import { TournamentCenterService } from "../api/center-service"
import { TournamentBookingService } from "../api/tournament-booking-service"
import type { TournamentBookingRequest } from "../types/booking"

export async function getTournamentCentersAction(tournamentId: string) {
  try {
    const data =
      await TournamentCenterService.getTournamentCenters(tournamentId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to fetch tournament centers:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function addTournamentCenterAction(
  tournamentId: string,
  centerIds: string[]
) {
  try {
    const data = await TournamentCenterService.addTournamentCenter(
      tournamentId,
      centerIds
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to add tournament center:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function removeTournamentCenterAction(
  tournamentId: string,
  centerId: string
) {
  try {
    const data = await TournamentCenterService.removeTournamentCenter(
      tournamentId,
      centerId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to remove tournament center:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function getTournamentBookingsAction(tournamentId: number) {
  try {
    const data = await TournamentBookingService.getBookings(tournamentId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to fetch tournament bookings:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function createTournamentBookingsAction(
  tournamentId: number,
  request: TournamentBookingRequest
) {
  try {
    const data = await TournamentBookingService.createBookings(
      tournamentId,
      request
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to create tournament booking:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function syncBookingStatusAction(tournamentId: number) {
  try {
    const data = await TournamentBookingService.syncBookingStatus(tournamentId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to sync bookings status:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function cancelBookingAction(
  tournamentId: number,
  bookingId: string
) {
  try {
    const data = await TournamentBookingService.cancelBooking(
      tournamentId,
      bookingId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to cancel booking:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function listAllSportCentersAction() {
  try {
    const result = await listSportCenters(100, 0)
    return { success: true, data: result.data }
  } catch (error: unknown) {
    console.error("Failed to list sport centers:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}
