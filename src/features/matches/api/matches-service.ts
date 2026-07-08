import { apiClient } from "@/lib/api-client"
import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  ApiEnvelope,
  ConfirmMatchResultInput,
  CreateMatchInput,
  ListMatchesParams,
  ListMatchesResult,
  Match,
  MatchesPaginationMeta,
  ScoreUpdate,
  UpdateLiveScoreInput,
  UserMatchStats,
} from "../types"

interface MatchesListEnvelope {
  message?: string
  data: Match[]
  meta?: MatchesPaginationMeta
}

interface MatchesListControllerResponse {
  items: Match[]
  meta?: MatchesPaginationMeta
}

function unwrapEnvelope<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data
  }

  return payload as T
}

function normalizeListMatchesPayload(payload: unknown): ListMatchesResult {
  if (Array.isArray(payload)) {
    return { data: payload as Match[] }
  }

  if (!payload || typeof payload !== "object") {
    return { data: [] }
  }

  const value = payload as {
    message?: unknown
    data?: unknown
    items?: unknown
    meta?: MatchesPaginationMeta
  }

  if (Array.isArray(value.items)) {
    return {
      message: typeof value.message === "string" ? value.message : undefined,
      data: value.items as Match[],
      meta: value.meta,
    }
  }

  if (Array.isArray(value.data)) {
    return {
      message: typeof value.message === "string" ? value.message : undefined,
      data: value.data as Match[],
      meta: value.meta,
    }
  }

  return { data: [] }
}

export async function createMatch(input: CreateMatchInput): Promise<Match> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<ApiEnvelope<Match> | Match>(
    "/api/matches",
    input
  )
  return unwrapEnvelope(response.data)
}

export async function listMatches(
  params: ListMatchesParams = {}
): Promise<ListMatchesResult> {
  const response = await apiClient.get<
    Match[] | MatchesListEnvelope | MatchesListControllerResponse
  >("/api/matches", {
    params,
  })

  return normalizeListMatchesPayload(response.data)
}

export async function getUserMatchStats(
  userId: string
): Promise<UserMatchStats> {
  const response = await apiClient.get<
    ApiEnvelope<UserMatchStats> | UserMatchStats
  >(`/api/matches/stats/${userId}`)
  return unwrapEnvelope(response.data)
}

export async function getMatchDetails(id: string): Promise<Match> {
  const response = await apiClient.get<ApiEnvelope<Match> | Match>(
    `/api/matches/${id}`
  )
  return unwrapEnvelope(response.data)
}

export async function getScoreHistory(id: string): Promise<ScoreUpdate[]> {
  const response = await apiClient.get<
    ApiEnvelope<ScoreUpdate[]> | ScoreUpdate[]
  >(`/api/matches/${id}/score-history`)

  const payload = unwrapEnvelope(response.data)
  return Array.isArray(payload) ? payload : []
}

export async function startMatch(
  id: string,
  payload?: { firstServingPlayerId?: string }
): Promise<Match> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<ApiEnvelope<Match> | Match>(
    `/api/matches/${id}/start`,
    payload
  )
  return unwrapEnvelope(response.data)
}

export async function updateLiveScore(
  id: string,
  input: UpdateLiveScoreInput
): Promise<Match> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<ApiEnvelope<Match> | Match>(
    `/api/matches/${id}/score`,
    input
  )
  return unwrapEnvelope(response.data)
}

export async function confirmMatchResult(
  id: string,
  input: ConfirmMatchResultInput = {}
): Promise<Match> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<ApiEnvelope<Match> | Match>(
    `/api/matches/${id}/confirm`,
    input
  )
  return unwrapEnvelope(response.data)
}

export async function cancelMatch(id: string): Promise<Match> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<ApiEnvelope<Match> | Match>(
    `/api/matches/${id}/cancel`
  )
  return unwrapEnvelope(response.data)
}
