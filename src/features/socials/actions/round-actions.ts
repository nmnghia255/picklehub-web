"use server"

import axios from "axios"

import { MatchService } from "@/features/socials/api/suggested-match-service"
import type { CommitRoundDto } from "@/features/socials/types/match"

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

export async function commitRoundAction(
  socialId: string,
  playSessionId: string,
  payload: CommitRoundDto
) {
  try {
    return await MatchService.commitRound(socialId, playSessionId, payload)
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Failed to commit round"))
  }
}

export async function startRoundAction(
  socialId: string,
  playSessionId: string,
  roundId: string
) {
  try {
    return await MatchService.startRound(socialId, playSessionId, roundId)
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Failed to start round"))
  }
}

export async function finishRoundAction(
  socialId: string,
  playSessionId: string,
  roundId: string
) {
  try {
    return await MatchService.finishRound(socialId, playSessionId, roundId)
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Failed to finish round"))
  }
}

export async function listRoundsAction(
  socialId: string,
  playSessionId: string
) {
  try {
    return await MatchService.listRounds(socialId, playSessionId)
  } catch {
    return []
  }
}

export async function completePlaySessionAction(
  socialId: string,
  playSessionId: string
) {
  try {
    return await MatchService.completePlaySession(socialId, playSessionId)
  } catch (error: unknown) {
    throw new Error(
      extractErrorMessage(error, "Failed to complete play session")
    )
  }
}
