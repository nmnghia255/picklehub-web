"use server"

import axios from "axios"

import { listFriends } from "@/features/friend/api/friend-service"
import { getMyProfile } from "@/features/profile/api/profile-service"
import { getAuthenticatedAxios } from "@/lib/server-api"

import { TournamentRegistrationService } from "../api/registration-service"
import type { RegistrationRequest } from "../types/registration"

export async function listTournamentRegistrationsAction(
  tournamentId: string,
  eventId: string = "",
  status: string = ""
) {
  try {
    const data =
      await TournamentRegistrationService.listTournamentEventRegistrations(
        tournamentId,
        eventId,
        status
      )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to list tournament registrations:", error)
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

export async function updateRegistrationStatusAction(
  tournamentId: string,
  registrationId: string,
  status: string,
  paymentStatus: string
) {
  try {
    const data = await TournamentRegistrationService.updateRegistrationStatus(
      tournamentId,
      registrationId,
      status,
      paymentStatus
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to update registration status:", error)
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

export async function confirmPaymentAction(
  tournamentId: string,
  registrationId: string,
  status: string,
  paymentStatus: string
) {
  try {
    const data = await TournamentRegistrationService.confirmPayment(
      tournamentId,
      registrationId,
      status,
      paymentStatus
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to confirm payment:", error)
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

export async function deleteRegistrationAction(
  tournamentId: string,
  registrationId: string
) {
  try {
    const data = await TournamentRegistrationService.deleteRegistration(
      tournamentId,
      registrationId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to delete registration:", error)
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

export async function getMyProfileAction() {
  try {
    const data = await getMyProfile()
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to get current user profile:", error)
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

export async function registerTournamentEventAction(
  tournamentId: string,
  eventId: string,
  payload: RegistrationRequest
) {
  try {
    const data = await TournamentRegistrationService.registerTournamentEvent(
      tournamentId,
      eventId,
      payload
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to register for tournament event:", error)
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

export async function uploadPaymentProofAction(
  tournamentId: string,
  registrationId: string,
  paymentProofUrl: string
) {
  try {
    const data = await TournamentRegistrationService.uploadPaymentProof(
      tournamentId,
      registrationId,
      paymentProofUrl
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to upload payment proof:", error)
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

export async function getFriendsAction() {
  try {
    const data = await listFriends()
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to list friends:", error)
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

export async function getUserProfileAction(userId: string) {
  try {
    const client = await getAuthenticatedAxios()
    const response = await client.get(`/api/users/${userId}`)
    const data = response.data.data || response.data
    return { success: true, data }
  } catch (error: unknown) {
    console.error(`Failed to get user profile ${userId}:`, error)
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
