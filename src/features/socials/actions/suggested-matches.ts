"use server"

import { MatchService } from "@/features/socials/api/suggested-match-service"
import type {
  CommitMatchRequest,
  SuggestedMatchRequest,
} from "@/features/socials/types/match"

export async function suggestMatches(
  socialId: string,
  playSessionId: string,
  payload: SuggestedMatchRequest
) {
  return await MatchService.suggestMatches(socialId, playSessionId, payload)
}

export async function confirmSuggestedMatchesAction(
  socialId: string,
  playSessionId: string,
  payload: CommitMatchRequest[]
) {
  return await MatchService.commitMatchBatches(socialId, playSessionId, payload)
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
