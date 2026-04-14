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
    return { data: payload as GroupPlaySession[] }
  }

  if (!payload || typeof payload !== "object") {
    return { data: [] }
  }

  const value = payload as {
    data?: unknown
    message?: unknown
    meta?: PlaySessionsPagination
  }

  if (Array.isArray(value.data)) {
    return {
      message: typeof value.message === "string" ? value.message : undefined,
      data: value.data as GroupPlaySession[],
      meta: value.meta,
    }
  }

  if (Array.isArray(value.data)) {
    return {
      message: typeof value.message === "string" ? value.message : undefined,
      data: value.data as GroupPlaySession[],
      meta: value.meta,
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
        message: typeof value.message === "string" ? value.message : undefined,
        data: nested.data as GroupPlaySession[],
        meta: nested.pagination,
      }
    }

    if (Array.isArray(nested.sessions)) {
      return {
        message: typeof value.message === "string" ? value.message : undefined,
        data: nested.sessions as GroupPlaySession[],
        meta: nested.pagination,
      }
    }
  }

  return { message: undefined, data: [], meta: undefined }
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
  const response = await axios.get<PlaySessionsListEnvelope>(
    "/api/play-sessions",
    {
      params,
    }
  )

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

export async function getMyPlaySessions(
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

// export async function listMySessions(
//   params: ListMySessionsParams = {}
// ): Promise<ListMySessionsResult> {
//   const listResult = await listPlaySessions(params)

//   return {
//     message: listResult.message,
//     data: listResult.data,
//     meta: listResult.meta,
//   }
// }

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
