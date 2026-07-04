import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CreateGuestInput,
  Guest,
  GuestListResponse,
} from "../types/guest-member"

export async function listGuests(
  groupId: string,
  params: {
    page?: number
    limit?: number
    status?: string
    invitedById?: string
  } = {}
): Promise<Guest[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<GuestListResponse>(
    `/api/groups/${groupId}/guests`,
    { params }
  )
  const list = response.data?.data ?? []

  return list.map((item) => {
    // Map new/old status fields
    let mappedStatus = item.status
    if (mappedStatus === "PENDING_APPROVAL") mappedStatus = "PENDING"
    if (mappedStatus === "ACTIVE") mappedStatus = "APPROVED"
    if (mappedStatus === "INACTIVE") mappedStatus = "EXPIRED"

    const guestsCount = item.guestsCount ?? item.guestCount ?? 0
    const sessionsCount = item.sessionsCount ?? item.sessionCount ?? 0
    const remainingSessions = item.remainingSessions ?? 0
    const memberId = item.memberId ?? item.invitedById
    const member = item.member ?? item.invitedBy

    return {
      ...item,
      guestsCount,
      sessionsCount,
      remainingSessions,
      memberId,
      member,
      status: mappedStatus,
      guestCount: guestsCount,
      sessionCount: sessionsCount,
      invitedById: memberId,
      invitedBy: member,
    } as Guest
  })
}

export async function createGuest(
  groupId: string,
  data: CreateGuestInput
): Promise<Guest> {
  const payload = {
    guestsCount: data.guestsCount ?? data.guestCount,
    sessionsCount: data.sessionsCount ?? data.sessionCount,
  }

  const axios = await getAuthenticatedAxios()
  const response = await axios.post<{ message: string; data: Guest }>(
    `/api/groups/${groupId}/guests`,
    payload
  )
  const item = response.data?.data ?? response.data

  let mappedStatus = item.status
  if (mappedStatus === "PENDING_APPROVAL") mappedStatus = "PENDING"
  if (mappedStatus === "ACTIVE") mappedStatus = "APPROVED"
  if (mappedStatus === "INACTIVE") mappedStatus = "EXPIRED"

  const guestsCount = item.guestsCount ?? item.guestCount ?? 0
  const sessionsCount = item.sessionsCount ?? item.sessionCount ?? 0
  const memberId = item.memberId ?? item.invitedById
  const member = item.member ?? item.invitedBy

  return {
    ...item,
    guestsCount,
    sessionsCount,
    remainingSessions: item.remainingSessions ?? 0,
    memberId,
    member,
    status: mappedStatus,
    guestCount: guestsCount,
    sessionCount: sessionsCount,
    invitedById: memberId,
    invitedBy: member,
  } as Guest
}

export async function approveGuests(
  groupId: string,
  data: { guestIds: string[]; status: "APPROVED" | "REJECTED" | "ACTIVE" }
): Promise<{ id: string; status: string }[]> {
  const mappedStatus = data.status === "ACTIVE" ? "APPROVED" : data.status
  const axios = await getAuthenticatedAxios()

  const promises = data.guestIds.map(async (guestId) => {
    await axios.patch<{ message: string; data: unknown }>(
      `/api/groups/${groupId}/guests/${guestId}/status`,
      { status: mappedStatus }
    )
    return { id: guestId, status: mappedStatus }
  })

  return Promise.all(promises)
}

export async function deactivateGuest(
  groupId: string,
  guestId: string
): Promise<void> {
  const axios = await getAuthenticatedAxios()
  await axios.patch(`/api/groups/${groupId}/guests/${guestId}/cancel`)
}
