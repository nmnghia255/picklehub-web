"use server"

import axios from "axios"

import { MatchService } from "@/features/socials/api/suggested-match-service"
import type {
  CommitMatchRequest,
  SuggestedMatchRequest,
} from "@/features/socials/types/match"

function extractErrorMessage(error: unknown, fallbackMessage: string): string {
  if (axios.isAxiosError(error)) {
    const dataMessage = error.response?.data?.message
    if (dataMessage) {
      return Array.isArray(dataMessage) ? dataMessage.join(", ") : dataMessage
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallbackMessage
}

export async function suggestMatches(
  socialId: string,
  playSessionId: string,
  payload: SuggestedMatchRequest
) {
  try {
    return await MatchService.suggestMatches(socialId, playSessionId, payload)
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Failed to suggest matches"))
  }
}

export async function confirmSuggestedMatchesAction(
  socialId: string,
  playSessionId: string,
  payload: CommitMatchRequest[]
) {
  try {
    return await MatchService.commitMatchBatches(
      socialId,
      playSessionId,
      payload
    )
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Failed to confirm matches"))
  }
}

export async function confirmMatchResultAction(
  matchId: string,
  payload: {
    winner: string
    scoreA: number
    scoreB: number
    sets: number[][]
  }
) {
  return await MatchService.confirmMatchResult(matchId, payload)
}

export async function startMatchAction(matchId: string) {
  return await MatchService.startMatch(matchId)
}
