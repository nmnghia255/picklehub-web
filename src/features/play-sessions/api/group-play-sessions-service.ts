import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  ApiEnvelope,
  CreateGroupPlaySessionInput,
  GroupPlaySession,
  ListPlaySessionParticipantsMeta,
  ListPlaySessionParticipantsParams,
  ListPlaySessionParticipantsResult,
  ListPlaySessionsParams,
  ParticipantsEnvelope,
  ParticipantsResponse,
  PlaySessionActionResult,
  PlaySessionParticipant,
  UpdateGroupPlaySessionInput,
} from "../types"
import { listPlaySessions } from "./public-play-sessions-service"
//import { Participant, ParticipantsResponse } from "../types"

// interface ApiEnvelope<T> {
//   message?: string
//   data: T
// }

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
  const response = await axios.get<ParticipantsResponse>(
    `/api/events/groups/${groupId}/play-sessions/${playSessionId}/participants`,
    {
      params,
    }
  )

  return {
    participants: Array.isArray(response.data.data) ? response.data.data : [],
    meta: response.data.pagination,
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

export type ListGroupPlaySessionsParams = Omit<
  ListPlaySessionsParams,
  "contextType" | "groupId"
>

export async function listGroupPlaySessions(
  groupId: string,
  params: ListGroupPlaySessionsParams = {}
): Promise<GroupPlaySession[]> {
  const result = await listPlaySessions({
    contextType: "INTERNAL_GROUP",
    groupId,
    ...params,
  })

  return Array.isArray(result.sessions) ? result.sessions : []
}
