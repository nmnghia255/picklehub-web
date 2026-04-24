import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  ChangeMemberRoleInput,
  ChangeMemberRoleResponse,
  CreateGroupInput,
  Group,
  GroupMemberActionResponse,
  Invitation,
  InviteLink,
  InviteLinkResponse,
  Member,
  UpdateGroupInput,
} from "../types"

interface GroupsPaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface PaginatedGroupsResponse {
  data: Group[]
  meta: GroupsPaginationMeta
}

interface GroupsEnvelopeResponse {
  data: Group[]
}

export interface ListAllGroupsParams {
  page?: number
  limit?: number
}

export interface ListAllGroupsResult {
  groups: Group[]
  meta?: GroupsPaginationMeta
}

function normalizeGroupsResponse(
  payload: Group[] | PaginatedGroupsResponse | GroupsEnvelopeResponse | unknown
): Group[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: Group[] }).data
  }

  return []
}

export async function getMyGroups(): Promise<Group[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<Group[] | GroupsEnvelopeResponse>(
    "/api/groups/me"
  )
  return normalizeGroupsResponse(response.data)
}

export type ListGroupsByUserIdParams = ListAllGroupsParams

export async function getGroupsByUserId(
  userId: string,
  params: ListGroupsByUserIdParams = {}
): Promise<Group[]> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    Group[] | PaginatedGroupsResponse | GroupsEnvelopeResponse
  >(`/api/groups/users/${userId}`, { params })

  return normalizeGroupsResponse(response.data)
}

export async function listAllGroups(
  params: ListAllGroupsParams = {}
): Promise<ListAllGroupsResult> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.get<
    Group[] | PaginatedGroupsResponse | GroupsEnvelopeResponse
  >("/api/groups", {
    params,
  })

  const groups = normalizeGroupsResponse(response.data)

  if (
    response.data &&
    typeof response.data === "object" &&
    "meta" in response.data
  ) {
    return {
      groups,
      meta: (response.data as PaginatedGroupsResponse).meta,
    }
  }

  return { groups }
}

export async function getGroups(): Promise<Group[]> {
  return getMyGroups()
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

export async function updateGroup(
  groupId: string,
  data: UpdateGroupInput
): Promise<Group> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<Group>(`/api/groups/${groupId}`, data)
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

export async function changeMemberRole(
  groupId: string,
  memberId: string,
  data: ChangeMemberRoleInput
): Promise<ChangeMemberRoleResponse> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<ChangeMemberRoleResponse>(
    `/api/groups/${groupId}/members/${memberId}/role`,
    data
  )
  return response.data
}

export async function kickMember(
  groupId: string,
  userId: string
): Promise<GroupMemberActionResponse> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<GroupMemberActionResponse>(
    `/api/groups/${groupId}/members/${userId}`
  )
  return response.data
}

export async function leaveGroup(
  groupId: string
): Promise<GroupMemberActionResponse> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.delete<GroupMemberActionResponse>(
    `/api/groups/${groupId}/members/me`
  )
  return response.data
}

export async function archiveGroup(groupId: string): Promise<Group> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.patch<Group>(`/api/groups/${groupId}/archive`)
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
