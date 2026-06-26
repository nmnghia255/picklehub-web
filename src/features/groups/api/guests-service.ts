import { getAuthenticatedAxios } from "@/lib/server-api"

import type { Guest, GuestListResponse } from "../types/guest-member"

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
  return response.data.data ?? []
}

export async function createGuest(
  groupId: string,
  data: {
    name: string
    email: string
    skillLevel: string
    phone?: string
    gender?: "MALE" | "FEMALE"
  }
): Promise<Guest> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<{ message: string; data: Guest }>(
    `/api/groups/${groupId}/guests`,
    data
  )
  return response.data.data
}

export async function approveGuests(
  groupId: string,
  data: { guestIds: string[]; status: "ACTIVE" | "REJECTED" }
): Promise<{ id: string; status: string }[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<{
    message: string
    data: { id: string; status: string }[]
  }>(`/api/groups/${groupId}/guests/approve`, data)
  return response.data.data
}

export async function deactivateGuest(
  groupId: string,
  guestId: string
): Promise<void> {
  const axios = await getAuthenticatedAxios()
  await axios.delete(`/api/groups/${groupId}/guests/${guestId}`)
}
