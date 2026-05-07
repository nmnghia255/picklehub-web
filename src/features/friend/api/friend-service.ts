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

function createAvatarUrl(seed: string) {
  return `https://i.pravatar.cc/160?u=${encodeURIComponent(seed)}`
}

function getUsernameFromEmail(email: string) {
  return email.split("@")[0] || email
}

function toDisplayName(name: string | null | undefined, email: string) {
  return name?.trim() || getUsernameFromEmail(email)
}

function mapSearchUser(item: GlobalUserSearchApiItem): FriendUser {
  const displayName = toDisplayName(item.name, item.email)

  return {
    id: item.id,
    username: getUsernameFromEmail(item.email),
    fullName: displayName,
    avatarUrl: createAvatarUrl(item.id),
    bio: item.isFriend ? "Da la ban be" : "Nguoi dung tren he thong",
    level: "Beginner",
    location: "Chua cap nhat",
    mutualFriends: item.mutualFriendsCount,
  }
}

function mapFriendship(item: FriendshipApiItem): FriendUser {
  const email = item.friend?.email ?? `${item.friendId}@unknown.local`
  const displayName = toDisplayName(item.friend?.name, email)

  return {
    id: item.friendId,
    username: getUsernameFromEmail(email),
    fullName: displayName,
    avatarUrl: createAvatarUrl(item.friendId),
    bio: "Da la ban be",
    level: "Intermediate",
    location: "Chua cap nhat",
    mutualFriends: item.mutualFriendsCount,
    becameFriendAt: item.createdAt,
    friendshipSinceLabel: "Dang tai",
  }
}

function mapRequest(
  item: FriendRequestApiItem,
  direction: "sent" | "received"
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
        ? "Loi moi ket ban da gui"
        : "Loi moi ket ban da nhan",
    level: "Beginner",
    location: "Chua cap nhat",
    mutualFriends: item.mutualFriendsCount,
    invitedAt: item.createdAt,
    inviteSource: "Friend service",
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
    const payload = await requestWithAuth<UnknownPayload>("/api/friends")
    return extractItems<FriendshipApiItem>(payload).map(mapFriendship)
  } catch {
    return []
  }
}

export async function listIncomingRequests(): Promise<FriendUser[]> {
  try {
    const payload = await requestWithAuth<UnknownPayload>(
      "/api/friends/requests/incoming"
    )
    return extractItems<FriendRequestApiItem>(payload).map((item) =>
      mapRequest(item, "received")
    )
  } catch {
    return []
  }
}

export async function listOutgoingRequests(): Promise<FriendUser[]> {
  try {
    const payload = await requestWithAuth<UnknownPayload>(
      "/api/friends/requests/outgoing"
    )
    return extractItems<FriendRequestApiItem>(payload).map((item) =>
      mapRequest(item, "sent")
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
    const payload = await requestWithAuth<UnknownPayload>(
      "/api/friends/users/search",
      {
        q,
        page,
        limit,
      }
    )

    return extractItems<GlobalUserSearchApiItem>(payload).map(mapSearchUser)
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
