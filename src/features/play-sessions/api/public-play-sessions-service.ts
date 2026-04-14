import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  ApiEnvelope,
  CountPlaySessionsEnvelope,
  CountPlaySessionsResult,
  CreateGroupPlaySessionInput,
  GetMyScheduleParams,
  GroupPlaySession,
  ListMySessionsParams,
  ListMySessionsResult,
  ListPlaySessionsParams,
  ListPlaySessionsResult,
  ListPublicParticipantsParams,
  ListPublicParticipantsResult,
  MyScheduleEnvelope,
  PlaySessionActionResult,
  PlaySessionsListEnvelope,
  PlaySessionsPagination,
  PublicParticipantsEnvelope,
  PublicPlaySessionParticipant,
  UpdateGroupPlaySessionInput,
} from "../types"
//import { Participant, ParticipantsResponse } from "../types"

function unwrapEnvelope<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data
  }

  return payload as T
}

function normalizePlaySessionsListPayload(
  payload: unknown
): ListPlaySessionsResult {
  if (Array.isArray(payload)) {
    return { sessions: payload as GroupPlaySession[] }
  }

  if (!payload || typeof payload !== "object") {
    return { sessions: [] }
  }

  const value = payload as {
    data?: unknown
    sessions?: unknown
    pagination?: PlaySessionsPagination
    filter?: Record<string, unknown>
  }

  if (Array.isArray(value.data)) {
    return {
      sessions: value.data as GroupPlaySession[],
      pagination: value.pagination,
      filter: value.filter,
    }
  }

  if (Array.isArray(value.sessions)) {
    return {
      sessions: value.sessions as GroupPlaySession[],
      pagination: value.pagination,
      filter: value.filter,
    }
  }

  // Some gateways wrap payload as: { data: { data: [...], pagination, filter } }
  if (value.data && typeof value.data === "object") {
    const nested = value.data as {
      data?: unknown
      sessions?: unknown
      pagination?: PlaySessionsPagination
      filter?: Record<string, unknown>
    }

    if (Array.isArray(nested.data)) {
      return {
        sessions: nested.data as GroupPlaySession[],
        pagination: nested.pagination,
        filter: nested.filter,
      }
    }

    if (Array.isArray(nested.sessions)) {
      return {
        sessions: nested.sessions as GroupPlaySession[],
        pagination: nested.pagination,
        filter: nested.filter,
      }
    }
  }

  return { sessions: [] }
}

export async function createPublicPlaySession(
  input: CreateGroupPlaySessionInput
): Promise<GroupPlaySession> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<
    GroupPlaySession | ApiEnvelope<GroupPlaySession>
  >("/api/play-sessions", input)
  return unwrapEnvelope(response.data)
}

export async function listPlaySessions(
  params: ListPlaySessionsParams = {}
): Promise<ListPlaySessionsResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    PlaySessionsListEnvelope | GroupPlaySession[]
  >("/api/play-sessions", {
    params,
  })

  return normalizePlaySessionsListPayload(response.data)
}

export async function countPlaySessions(
  params: Omit<
    ListPlaySessionsParams,
    "sortBy" | "order" | "page" | "limit"
  > = {}
): Promise<CountPlaySessionsResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    CountPlaySessionsEnvelope | ApiEnvelope<CountPlaySessionsResult>
  >("/api/play-sessions/count", {
    params,
  })

  return unwrapEnvelope(response.data)
}

export async function getMyPlaySessionSchedule(
  params: GetMyScheduleParams = {}
): Promise<GroupPlaySession[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<MyScheduleEnvelope | GroupPlaySession[]>(
    "/api/play-sessions/my-schedule",
    {
      params,
    }
  )

  const payload = response.data

  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === "object" && Array.isArray(payload.data)) {
    return payload.data
  }

  return []
}

export async function listMySessions(
  params: ListMySessionsParams = {}
): Promise<ListMySessionsResult> {
  const listResult = await listPlaySessions(params)

  return {
    sessions: listResult.sessions,
    meta: listResult.pagination
      ? {
          page: listResult.pagination.page,
          limit: listResult.pagination.limit,
          total: listResult.pagination.total,
          totalPages: listResult.pagination.totalPages,
        }
      : undefined,
  }
}

export async function getPublicPlaySessionDetail(
  playSessionId: string
): Promise<GroupPlaySession> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    ApiEnvelope<GroupPlaySession> | GroupPlaySession
  >(`/api/play-sessions/${playSessionId}`)
  return unwrapEnvelope(response.data)
}

export async function updatePublicPlaySession(
  playSessionId: string,
  input: UpdateGroupPlaySessionInput
): Promise<GroupPlaySession> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<
    ApiEnvelope<GroupPlaySession> | GroupPlaySession
  >(`/api/play-sessions/${playSessionId}`, input)
  return unwrapEnvelope(response.data)
}

export async function deletePublicPlaySession(
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<PlaySessionActionResult>(
    `/api/play-sessions/${playSessionId}`
  )
  return response.data
}

export async function joinPublicPlaySession(
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/play-sessions/${playSessionId}/participants/me`
  )
  return response.data
}

export async function leavePublicPlaySession(
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<PlaySessionActionResult>(
    `/api/play-sessions/${playSessionId}/participants/me`
  )
  return response.data
}

export async function kickPublicPlaySessionParticipant(
  playSessionId: string,
  userId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<PlaySessionActionResult>(
    `/api/play-sessions/${playSessionId}/participants/${userId}`
  )
  return response.data
}

export async function listPublicPlaySessionParticipants(
  playSessionId: string,
  params: ListPublicParticipantsParams = {}
): Promise<ListPublicParticipantsResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    PublicParticipantsEnvelope | PublicPlaySessionParticipant[]
  >(`/api/play-sessions/${playSessionId}/participants`, {
    params,
  })

  if (Array.isArray(response.data)) {
    return { participants: response.data }
  }

  return {
    participants: Array.isArray(response.data.data) ? response.data.data : [],
    pagination: response.data.pagination,
  }
}

export async function startPublicPlaySession(
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/play-sessions/${playSessionId}/start`
  )
  return response.data
}

export async function completePublicPlaySession(
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/play-sessions/${playSessionId}/complete`
  )
  return response.data
}

export async function cancelPublicPlaySession(
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/play-sessions/${playSessionId}/cancel`
  )
  return response.data
}
