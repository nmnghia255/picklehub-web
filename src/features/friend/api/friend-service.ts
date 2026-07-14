import { headers } from "next/headers"

import { type CommonLocale, getFriendCommonSection } from "@/i18n/common-locale"
import { getAuthenticatedAxios } from "@/lib/server-api"

import type { FriendUser } from "../types"

interface FriendRequestApiItem {
  id: string
  senderId: string
  sender: { id: string; name: string | null; email: string } | null
  receiverId: string
  receiver: { id: string; name: string | null; email: string } | null
  status: string
  mutualFriendsCount: number
  createdAt: string
  updatedAt: string
}

interface FriendshipApiItem {
  id: string
  userId: string
  friendId: string
  friend: { id: string; name: string | null; email: string } | null
  mutualFriendsCount: number
  createdAt: string
}

interface GlobalUserSearchApiItem {
  id: string
  name: string | null
  email: string
  isFriend: boolean
  mutualFriendsCount: number
}

type UnknownPayload = unknown

async function getCommonLocale(): Promise<CommonLocale> {
  const acceptLanguage = (await headers()).get("accept-language") ?? ""
  const { default: enCommon } = await import("@/i18n/locales/en/common.json")
  const { default: viCommon } = await import("@/i18n/locales/vi/common.json")

  return acceptLanguage.toLowerCase().startsWith("vi") ? viCommon : enCommon
}

function createAvatarUrl(seed: string) {
  return `https://i.pravatar.cc/160?u=${encodeURIComponent(seed)}`
}

function getUsernameFromEmail(email: string) {
  return email.split("@")[0] || email
}

function toDisplayName(name: string | null | undefined, email: string) {
  return name?.trim() || getUsernameFromEmail(email)
}

function mapSearchUser(
  item: GlobalUserSearchApiItem,
  common: ReturnType<typeof getFriendCommonSection>
): FriendUser {
  const displayName = toDisplayName(item.name, item.email)

  return {
    id: item.id,
    username: getUsernameFromEmail(item.email),
    fullName: displayName,
    avatarUrl: createAvatarUrl(item.id),
    bio: item.isFriend ? common.service.friendBio : common.service.userBio,
    level: "Beginner",
    location: common.service.location,
    mutualFriends: item.mutualFriendsCount,
  }
}

function mapFriendship(
  item: FriendshipApiItem,
  common: ReturnType<typeof getFriendCommonSection>
): FriendUser {
  const email = item.friend?.email ?? `${item.friendId}@unknown.local`
  const displayName = toDisplayName(item.friend?.name, email)

  return {
    id: item.friendId,
    username: getUsernameFromEmail(email),
    fullName: displayName,
    avatarUrl: createAvatarUrl(item.friendId),
    bio: common.service.friendBio,
    level: "Intermediate",
    location: common.service.location,
    mutualFriends: item.mutualFriendsCount,
    becameFriendAt: item.createdAt,
    friendshipSinceLabel: common.service.loading,
  }
}

function mapRequest(
  item: FriendRequestApiItem,
  direction: "sent" | "received",
  common: ReturnType<typeof getFriendCommonSection>
): FriendUser {
  const counterpart = direction === "sent" ? item.receiver : item.sender
  const counterpartId = direction === "sent" ? item.receiverId : item.senderId
  const email = counterpart?.email ?? `${counterpartId}@unknown.local`
  const displayName = toDisplayName(counterpart?.name, email)

  return {
    id: item.id,
    counterpartId,
    username: getUsernameFromEmail(email),
    fullName: displayName,
    avatarUrl: createAvatarUrl(counterpartId),
    bio:
      direction === "sent"
        ? common.service.requestSentBio
        : common.service.requestReceivedBio,
    level: "Beginner",
    location: common.service.location,
    mutualFriends: item.mutualFriendsCount,
    invitedAt: item.createdAt,
    inviteSource: common.service.inviteSource,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function extractItems<T>(payload: UnknownPayload): T[] {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (!isRecord(payload)) {
    return []
  }

  const maybeData = payload.data

  if (Array.isArray(maybeData)) {
    return maybeData as T[]
  }

  if (isRecord(maybeData) && Array.isArray(maybeData.data)) {
    return maybeData.data as T[]
  }

  return []
}

async function requestWithAuth<T>(
  path: string,
  params?: Record<string, string | number>
) {
  const client = await getAuthenticatedAxios()
  const response = await client.get<T>(path, { params })

  return response.data
}

export async function listFriends(): Promise<FriendUser[]> {
  try {
    const common = getFriendCommonSection(await getCommonLocale())
    const payload = await requestWithAuth<UnknownPayload>("/api/friends")
    return extractItems<FriendshipApiItem>(payload).map((item) =>
      mapFriendship(item, common)
    )
  } catch {
    return []
  }
}

export async function listIncomingRequests(): Promise<FriendUser[]> {
  try {
    const common = getFriendCommonSection(await getCommonLocale())
    const payload = await requestWithAuth<UnknownPayload>(
      "/api/friends/requests/incoming"
    )
    return extractItems<FriendRequestApiItem>(payload).map((item) =>
      mapRequest(item, "received", common)
    )
  } catch {
    return []
  }
}

export async function listOutgoingRequests(): Promise<FriendUser[]> {
  try {
    const common = getFriendCommonSection(await getCommonLocale())
    const payload = await requestWithAuth<UnknownPayload>(
      "/api/friends/requests/outgoing"
    )
    return extractItems<FriendRequestApiItem>(payload).map((item) =>
      mapRequest(item, "sent", common)
    )
  } catch {
    return []
  }
}

export async function searchUsers(
  q: string,
  page = 1,
  limit = 20
): Promise<FriendUser[]> {
  try {
    const common = getFriendCommonSection(await getCommonLocale())
    const payload = await requestWithAuth<UnknownPayload>(
      "/api/friends/users/search",
      {
        q,
        page,
        limit,
      }
    )

    return extractItems<GlobalUserSearchApiItem>(payload).map((item) =>
      mapSearchUser(item, common)
    )
  } catch {
    return []
  }
}

async function mutateWithAuth(
  method: "post" | "patch" | "delete",
  path: string,
  body?: unknown
) {
  try {
    const client = await getAuthenticatedAxios()
    console.log(
      `[mutateWithAuth] Making ${method.toUpperCase()} request to ${path}`,
      { body }
    )
    const response = await client.request({
      method,
      url: path,
      data: body,
    })
    console.log(
      `[mutateWithAuth] ${method.toUpperCase()} ${path} success:`,
      response.data
    )

    return response.data
  } catch (error) {
    console.error(
      `[mutateWithAuth] ${method.toUpperCase()} ${path} failed:`,
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error
    )
    throw error
  }
}

export async function sendFriendRequest(payload: {
  receiverId: string
  message?: string
}) {
  return mutateWithAuth("post", "/api/friends/requests", payload)
}

export async function acceptRequest(requestId: string) {
  return mutateWithAuth(
    "patch",
    `/api/friends/requests/${requestId}/accept`,
    {}
  )
}

export async function rejectRequest(requestId: string) {
  return mutateWithAuth(
    "patch",
    `/api/friends/requests/${requestId}/reject`,
    {}
  )
}

export async function cancelRequest(requestId: string) {
  return mutateWithAuth(
    "patch",
    `/api/friends/requests/${requestId}/cancel`,
    {}
  )
}

export async function removeFriend(friendId: string) {
  return mutateWithAuth("delete", `/api/friends/${friendId}`)
}
