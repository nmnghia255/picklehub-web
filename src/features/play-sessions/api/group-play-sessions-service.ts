import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CreateGroupPlaySessionInput,
  GroupPlaySession,
  PlaySessionActionResult,
  PlaySessionParticipant,
  UpdateGroupPlaySessionInput,
} from "./public-play-sessions-service"

export type {
  CreateGroupPlaySessionInput,
  GroupPlaySession,
  PlaySessionActionResult,
  PlaySessionParticipant,
  UpdateGroupPlaySessionInput,
} from "./public-play-sessions-service"

export interface ListPlaySessionParticipantsParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export interface ListPlaySessionParticipantsMeta {
  total: number
  page: number
  limit: number
}

export interface ListPlaySessionParticipantsResult {
  participants: PlaySessionParticipant[]
  meta?: ListPlaySessionParticipantsMeta
}

interface ApiEnvelope<T> {
  message?: string
  data: T
}

interface ParticipantsEnvelope {
  participants: PlaySessionParticipant[]
  meta?: ListPlaySessionParticipantsMeta
}

function unwrapEnvelope<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data
  }

  return payload as T
}

export async function createGroupPlaySession(
  groupId: string,
  input: CreateGroupPlaySessionInput
): Promise<GroupPlaySession> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<ApiEnvelope<GroupPlaySession>>(
    `/api/events/groups/${groupId}/play-sessions`,
    input
  )
  return unwrapEnvelope(response.data)
}

export async function getGroupPlaySessionDetail(
  groupId: string,
  playSessionId: string
): Promise<GroupPlaySession> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiEnvelope<GroupPlaySession>>(
    `/api/events/groups/${groupId}/play-sessions/${playSessionId}`
  )
  return unwrapEnvelope(response.data)
}

export async function updateGroupPlaySession(
  groupId: string,
  playSessionId: string,
  input: UpdateGroupPlaySessionInput
): Promise<GroupPlaySession> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<ApiEnvelope<GroupPlaySession>>(
    `/api/events/groups/${groupId}/play-sessions/${playSessionId}`,
    input
  )
  return unwrapEnvelope(response.data)
}

export async function deleteGroupPlaySession(
  groupId: string,
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<PlaySessionActionResult>(
    `/api/events/groups/${groupId}/play-sessions/${playSessionId}`
  )
  return response.data
}

export async function joinGroupPlaySession(
  groupId: string,
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/events/groups/${groupId}/play-sessions/${playSessionId}/participants/me`
  )
  return response.data
}

export async function leaveGroupPlaySession(
  groupId: string,
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<PlaySessionActionResult>(
    `/api/events/groups/${groupId}/play-sessions/${playSessionId}/participants/me`
  )
  return response.data
}

export async function kickGroupPlaySessionParticipant(
  groupId: string,
  playSessionId: string,
  userId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<PlaySessionActionResult>(
    `/api/events/groups/${groupId}/play-sessions/${playSessionId}/participants/${userId}`
  )
  return response.data
}

export async function listGroupPlaySessionParticipants(
  groupId: string,
  playSessionId: string,
  params: ListPlaySessionParticipantsParams = {}
): Promise<ListPlaySessionParticipantsResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<ApiEnvelope<ParticipantsEnvelope>>(
    `/api/events/groups/${groupId}/play-sessions/${playSessionId}/participants`,
    {
      params,
    }
  )

  const payload = unwrapEnvelope(response.data)

  return {
    participants: Array.isArray(payload.participants)
      ? payload.participants
      : [],
    meta: payload.meta,
  }
}

export async function startGroupPlaySession(
  groupId: string,
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/events/groups/${groupId}/play-sessions/${playSessionId}/start`
  )
  return response.data
}

export async function completeGroupPlaySession(
  groupId: string,
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/events/groups/${groupId}/play-sessions/${playSessionId}/complete`
  )
  return response.data
}

export async function cancelGroupPlaySession(
  groupId: string,
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/events/groups/${groupId}/play-sessions/${playSessionId}/cancel`
  )
  return response.data
}
