"use server"

import {
  confirmMatchResult,
  getMatchDetails,
  startMatch,
  updateLiveScore,
} from "./api/matches-service"
import type { ConfirmMatchResultInput } from "./types"

export async function resetMatchScoreAction(matchId: string) {
  try {
    const data = await updateLiveScore(matchId, {
      scoreA: 0,
      scoreB: 0,
      sets: [],
    })
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to reset match score via matches-service:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reset match score",
    }
  }
}

export async function getMatchDetailsAction(matchId: string) {
  try {
    const data = await getMatchDetails(matchId)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to get match details via matches-service:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get match details",
    }
  }
}

export async function startMatchAction(
  matchId: string,
  payload?: { firstServingPlayerId: string }
) {
  try {
    const data = await startMatch(matchId, payload)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to start match via matches-service:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start match",
    }
  }
}

export async function confirmMatchResultAction(
  matchId: string,
  input: ConfirmMatchResultInput = {}
) {
  try {
    console.log("SERVER ACTION - confirmMatchResultAction raw input:", {
      matchId,
      input: JSON.stringify(input),
    })
    const data = await confirmMatchResult(matchId, input)
    return { success: true, data }
  } catch (error: unknown) {
    console.error("Failed to confirm match result via matches-service:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to confirm match result",
    }
  }
}
