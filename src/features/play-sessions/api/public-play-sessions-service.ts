import { getAuthenticatedAxios } from "@/lib/server-api"

export interface PlaySessionParticipant {
  userId: string
  joinedAt?: string
  displayName?: string
  status?: string
  isHost?: boolean
}

export interface GroupPlaySession {
  id: string
  title: string
  description?: string | null
  type: "PUBLIC_APP" | "INTERNAL_GROUP" | string
  groupId: string | null
  courtBookingId?: string | null
  maxSlots?: number | null
  joinedCount?: number
  startTime: string
  endTime: string
  status: string
  creatorId: string
  participants?: PlaySessionParticipant[]
  createdAt: string
  updatedAt: string
}

export interface CreateGroupPlaySessionInput {
  title: string
  description?: string
  startTime: string
  endTime: string
  courtBookingId?: string
  maxSlots?: number
}

export interface UpdateGroupPlaySessionInput {
  title?: string
  description?: string
  courtBookingId?: string | null
  location?: string
  startTime?: string
  endTime?: string
  maxSlots?: number
}

export interface ListMySessionsParams {
  contextType?: "PUBLIC_APP" | "INTERNAL_GROUP" | string
  page?: number
  limit?: number
  search?: string
  status?: string
}

export interface ListMySessionsMeta {
  total: number
  page: number
  limit: number
  totalPages?: number
}

export interface ListMySessionsResult {
  sessions: GroupPlaySession[]
  meta?: ListMySessionsMeta
}

export interface ListPlaySessionsParams {
  contextType?: "PUBLIC_APP" | "INTERNAL_GROUP" | string
  groupId?: string
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | string
  search?: string
  startFrom?: string
  startTo?: string
  creatorId?: string
  sortBy?: "createdAt" | "startTime"
  order?: "asc" | "desc"
  page?: number
  limit?: number
}

export interface PlaySessionsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ListPlaySessionsResult {
  sessions: GroupPlaySession[]
  pagination?: PlaySessionsPagination
  filter?: Record<string, unknown>
}

export interface CountPlaySessionsResult {
  type: string
  groupId?: string
  total: number
}

export interface GetMyScheduleParams {
  contextType?: "PUBLIC_APP" | "INTERNAL_GROUP" | string
  groupId?: string
  period?: "week" | "month"
}

export interface PublicPlaySessionParticipant {
  userId: string
  joinedAt: string
}

export interface ListPublicParticipantsParams {
  page?: number
  limit?: number
}

export interface ListPublicParticipantsResult {
  participants: PublicPlaySessionParticipant[]
  pagination?: PlaySessionsPagination
}

export interface PlaySessionActionResult {
  message?: string
  data?: {
    playSessionId?: string
    userId?: string
    status?: string
    startedAt?: string
    completedAt?: string
    cancelledAt?: string
    cancelledBy?: string
    id?: string
  }
}

interface ApiEnvelope<T> {
  message?: string
  data: T
}

interface PlaySessionsListEnvelope {
  message?: string
  data: GroupPlaySession[]
  pagination?: PlaySessionsPagination
  filter?: Record<string, unknown>
}

interface CountPlaySessionsEnvelope {
  message?: string
  data: CountPlaySessionsResult
  filter?: Record<string, unknown>
}

interface MyScheduleEnvelope {
  message?: string
  data: GroupPlaySession[]
  filter?: Record<string, unknown>
}

interface PublicParticipantsEnvelope {
  message?: string
  data: PublicPlaySessionParticipant[]
  pagination?: PlaySessionsPagination
}

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
  >("/api/events/play-sessions", {
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
  >("/api/events/play-sessions/count", {
    params,
  })

  return unwrapEnvelope(response.data)
}

export async function getMyPlaySessionSchedule(
  params: GetMyScheduleParams = {}
): Promise<GroupPlaySession[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<MyScheduleEnvelope | GroupPlaySession[]>(
    "/api/events/play-sessions/my-schedule",
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
  >(`/api/events/play-sessions/${playSessionId}`)
  return unwrapEnvelope(response.data)
}

export async function updatePublicPlaySession(
  playSessionId: string,
  input: UpdateGroupPlaySessionInput
): Promise<GroupPlaySession> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<
    ApiEnvelope<GroupPlaySession> | GroupPlaySession
  >(`/api/events/play-sessions/${playSessionId}`, input)
  return unwrapEnvelope(response.data)
}

export async function deletePublicPlaySession(
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<PlaySessionActionResult>(
    `/api/events/play-sessions/${playSessionId}`
  )
  return response.data
}

export async function joinPublicPlaySession(
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/events/play-sessions/${playSessionId}/participants/me`
  )
  return response.data
}

export async function leavePublicPlaySession(
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<PlaySessionActionResult>(
    `/api/events/play-sessions/${playSessionId}/participants/me`
  )
  return response.data
}

export async function kickPublicPlaySessionParticipant(
  playSessionId: string,
  userId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<PlaySessionActionResult>(
    `/api/events/play-sessions/${playSessionId}/participants/${userId}`
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
  >(`/api/events/play-sessions/${playSessionId}/participants`, {
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
    `/api/events/play-sessions/${playSessionId}/start`
  )
  return response.data
}

export async function completePublicPlaySession(
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/events/play-sessions/${playSessionId}/complete`
  )
  return response.data
}

export async function cancelPublicPlaySession(
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/events/play-sessions/${playSessionId}/cancel`
  )
  return response.data
}
