"use server"

import axios from "axios"

import { TournamentGroupStageService } from "../api/group-stage-service"
import type {
  AdvanceTeamsRequest,
  ConfigureGroupStageRequest,
  DrawGroupsRequest,
} from "../types/group-stage"

export async function configureGroupStageAction(
  tournamentId: number,
  eventId: number,
  payload: ConfigureGroupStageRequest
) {
  try {
    const data = await TournamentGroupStageService.configureGroupStage(
      tournamentId,
      eventId,
      payload
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to configure group stage:", error)
    let errorMessage = "Failed to configure group stage"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function drawGroupsAction(
  tournamentId: number,
  eventId: number,
  payload?: DrawGroupsRequest
) {
  try {
    const data = await TournamentGroupStageService.drawGroups(
      tournamentId,
      eventId,
      payload
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to draw groups:", error)
    let errorMessage = "Failed to draw groups"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function generateMatchesAction(
  tournamentId: number,
  eventId: number
) {
  try {
    const data = await TournamentGroupStageService.generateMatches(
      tournamentId,
      eventId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to generate group stage matches:", error)
    let errorMessage = "Failed to generate group stage matches"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function listGroupsAction(tournamentId: number, eventId: number) {
  try {
    const data = await TournamentGroupStageService.listGroups(
      tournamentId,
      eventId
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to list groups:", error)
    let errorMessage = "Failed to list groups"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function advanceTeamsAction(
  tournamentId: number,
  eventId: number,
  payload: AdvanceTeamsRequest
) {
  try {
    const data = await TournamentGroupStageService.advanceTeams(
      tournamentId,
      eventId,
      payload
    )
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to advance teams:", error)
    let errorMessage = "Failed to advance teams"
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}
