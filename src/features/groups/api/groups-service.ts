import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  CreateGroupInput,
  Group,
  Invitation,
  InviteLink,
  InviteLinkResponse,
  Member,
} from "../types"

export async function getGroups(): Promise<Group[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<Group[]>("/api/groups")
  return response.data
}

export async function getGroup(groupId: string): Promise<Group> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<Group>(`/api/groups/${groupId}`)
  return response.data
}

export async function createGroup(data: CreateGroupInput): Promise<Group> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<Group>("/api/groups", data)
  return response.data
}

export async function inviteToGroup(
  groupId: string,
  email: string
): Promise<Invitation> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<Invitation>(
    `/api/groups/${groupId}/invitations`,
    { email }
  )
  return response.data
}

export async function getGroupMembers(groupId: string): Promise<Member[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<Member[]>(`/api/groups/${groupId}/members`)
  return response.data
}

export async function getGroupInvitations(
  groupId: string
): Promise<Invitation[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<Invitation[]>(
    `/api/groups/${groupId}/invitations`
  )
  return response.data
}

export async function revokeInvitation(
  groupId: string,
  invitationId: string
): Promise<void> {
  const axios = await getAuthenticatedAxios()
  await axios.delete(`/api/groups/${groupId}/invitations/${invitationId}`)
}

/** @deprecated */
export async function createInviteLink(
  groupId: string
): Promise<InviteLinkResponse> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<InviteLinkResponse>(
    `/api/groups/${groupId}/invite-links`
  )
  return response.data
}

/** @deprecated */
export async function getInviteLinks(groupId: string): Promise<InviteLink[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<InviteLink[]>(
    `/api/groups/${groupId}/invite-links`
  )
  return response.data
}

/** @deprecated */
export async function revokeInviteLink(
  groupId: string,
  linkId: string
): Promise<void> {
  const axios = await getAuthenticatedAxios()
  await axios.delete(`/api/groups/${groupId}/invite-links/${linkId}`)
}
