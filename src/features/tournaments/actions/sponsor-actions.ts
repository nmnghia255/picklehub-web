"use server"

import axios from "axios"

import { TournamentSponsorService } from "../api/sponsor-service"
import type { SponsorRequest } from "../types/sponsor"

export async function getSponsorsAction(tournamentId: string) {
  try {
    const data = await TournamentSponsorService.getSponsors(tournamentId)
    return { success: true, data }
  } catch (error: unknown) {
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function addSponsorAction(
  sponsor: SponsorRequest,
  tournamentId: string
) {
  try {
    const data = await TournamentSponsorService.addSponsor(
      sponsor,
      tournamentId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to add sponsor:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}

export async function deleteSponsorAction(id: string, tournamentId: string) {
  try {
    const data = await TournamentSponsorService.deleteSponsor(id, tournamentId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to delete sponsor:", error)
    let errorMessage = ""
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || ""
    }
    return { success: false, error: errorMessage }
  }
}
