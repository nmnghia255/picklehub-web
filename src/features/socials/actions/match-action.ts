"use server"

import { MatchService } from "../api/suggested-match-service"
import type {
  CommitMatchBatchResponse,
  CommitMatchRequest,
  ListPlaySessionMatchesResponse,
  SuggestedMatchBatchResponse,
  SuggestedMatchRequest,
} from "../types/match"

export async function suggestMatchesAction(
  socialId: string,
  sessionId: string,
  payload: SuggestedMatchRequest
): Promise<SuggestedMatchBatchResponse> {
  return await MatchService.suggestMatches(socialId, sessionId, payload)
}

export async function commitMatchBatchesAction(
  socialId: string,
  sessionId: string,
  payload: CommitMatchRequest[]
): Promise<CommitMatchBatchResponse> {
  return await MatchService.commitMatchBatches(socialId, sessionId, payload)
}

export async function listPlaySessionMatchesAction(
  playSessionId: string,
  page: number = 1,
  limit: number = 100
): Promise<ListPlaySessionMatchesResponse> {
  return await MatchService.listMatches({ playSessionId, page, limit })
}
