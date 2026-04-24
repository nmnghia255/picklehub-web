import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  ApiEnvelope,
  ApproveGuestInput,
  CreateGroupPlaySessionInput,
  GroupPlaySession,
  JoinPlaySessionReponse,
  ListPlaySessionGuestsParams,
  ListPlaySessionGuestsResult,
  ListPlaySessionParticipantsParams,
  ListPlaySessionParticipantsResult,
  ListPlaySessionsParams,
  ParticipantsResponse,
  PlaySessionActionResult,
  PlaySessionGuest,
  RequestGuestInput,
  UpdateGroupPlaySessionInput,
} from "../types"
import { normalizeGuests } from "./guests-normalizer"
import { normalizeParticipants } from "./participants-normalizer"

function unwrapEnvelope<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data
  }

  return payload as T
}

function normalizeGuestsPayload(payload: unknown): ListPlaySessionGuestsResult {
  if (Array.isArray(payload)) {
    return { data: normalizeGuests(payload) }
  }

  if (!payload || typeof payload !== "object") {
    return { data: [] }
  }

  const value = payload as {
    message?: unknown
    data?: unknown
    guests?: unknown
  }

  if (Array.isArray(value.data)) {
    return {
      data: normalizeGuests(value.data),
      message: typeof value.message === "string" ? value.message : undefined,
    }
  }

  if (Array.isArray(value.guests)) {
    return {
      data: normalizeGuests(value.guests),
      message: typeof value.message === "string" ? value.message : undefined,
    }
  }

  if (value.data && typeof value.data === "object") {
    const nested = value.data as {
      data?: unknown
      guests?: unknown
      message?: unknown
    }

    if (Array.isArray(nested.data)) {
      return {
        data: normalizeGuests(nested.data),
        message:
          typeof value.message === "string"
            ? value.message
            : typeof nested.message === "string"
              ? nested.message
              : undefined,
      }
    }

    if (Array.isArray(nested.guests)) {
      return {
        data: normalizeGuests(nested.guests),
        message:
          typeof value.message === "string"
            ? value.message
            : typeof nested.message === "string"
              ? nested.message
              : undefined,
      }
    }
  }

  return {
    data: [],
    message: typeof value.message === "string" ? value.message : undefined,
  }
}

export async function createGroupPlaySession(
  groupId: string,
  input: CreateGroupPlaySessionInput
): Promise<GroupPlaySession> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<ApiEnvelope<GroupPlaySession>>(
    `/api/groups/${groupId}/play-sessions`,
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
    `/api/groups/${groupId}/play-sessions/${playSessionId}`
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
    `/api/groups/${groupId}/play-sessions/${playSessionId}`,
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
    `/api/groups/${groupId}/play-sessions/${playSessionId}`
  )
  return response.data
}

export async function joinGroupPlaySession(
  groupId: string,
  playSessionId: string,
  data: {
    guestsCount?: number
  }
): Promise<JoinPlaySessionReponse> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<JoinPlaySessionReponse>(
    `/api/groups/${groupId}/play-sessions/${playSessionId}/join`,
    data
  )
  return response.data
}

export async function submitGroupPlaySessionPayment(
  groupId: string,
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/groups/${groupId}/play-sessions/${playSessionId}/participants/me/payment/submit`
  )

  return response.data
}

export async function approveGroupPlaySessionPayment(
  groupId: string,
  playSessionId: string,
  userId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/groups/${groupId}/play-sessions/${playSessionId}/participants/${userId}/payment/approve`
  )

  return response.data
}

export async function leaveGroupPlaySession(
  groupId: string,
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<PlaySessionActionResult>(
    `/api/groups/${groupId}/play-sessions/${playSessionId}/participants/me`
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
    `/api/groups/${groupId}/play-sessions/${playSessionId}/participants/${userId}`
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
    `/api/groups/${groupId}/play-sessions/${playSessionId}/participants`,
    {
      params,
    }
  )

  return {
    data: Array.isArray(response.data.data)
      ? normalizeParticipants(response.data.data)
      : [],
    message: response.data.message,
  }
}

export async function startGroupPlaySession(
  groupId: string,
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/groups/${groupId}/play-sessions/${playSessionId}/start`
  )
  return response.data
}

export async function completeGroupPlaySession(
  groupId: string,
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/groups/${groupId}/play-sessions/${playSessionId}/complete`
  )
  return response.data
}

export async function cancelGroupPlaySession(
  groupId: string,
  playSessionId: string
): Promise<PlaySessionActionResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<PlaySessionActionResult>(
    `/api/groups/${groupId}/play-sessions/${playSessionId}/cancel`
  )
  return response.data
}

export async function requestGroupPlaySessionGuest(
  groupId: string,
  playSessionId: string,
  data: RequestGuestInput
): Promise<PlaySessionGuest> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<ApiEnvelope<PlaySessionGuest>>(
    `/api/groups/${groupId}/play-sessions/${playSessionId}/guests/request`,
    data
  )

  return unwrapEnvelope(response.data)
}

export async function reserveGroupPlaySessionGuest(
  groupId: string,
  playSessionId: string,
  data: RequestGuestInput
): Promise<PlaySessionGuest> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<ApiEnvelope<PlaySessionGuest>>(
    `/api/groups/${groupId}/play-sessions/${playSessionId}/guests/reserve`,
    data
  )

  return unwrapEnvelope(response.data)
}

export async function approveGroupPlaySessionGuest(
  groupId: string,
  playSessionId: string,
  guestId: string,
  data: ApproveGuestInput
): Promise<PlaySessionGuest> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<ApiEnvelope<PlaySessionGuest>>(
    `/api/groups/${groupId}/play-sessions/${playSessionId}/guests/${guestId}/approve`,
    data
  )

  return unwrapEnvelope(response.data)
}

export async function listGroupPlaySessionGuests(
  groupId: string,
  playSessionId: string,
  params: ListPlaySessionGuestsParams = {}
): Promise<ListPlaySessionGuestsResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get(
    `/api/groups/${groupId}/play-sessions/${playSessionId}/guests`,
    {
      params,
    }
  )

  return normalizeGuestsPayload(response.data)
}

export type ListGroupPlaySessionsParams = Omit<
  ListPlaySessionsParams,
  "contextType" | "groupId"
>
