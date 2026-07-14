import { headers } from "next/headers"

import enCommon from "@/i18n/locales/en/common.json"
import viCommon from "@/i18n/locales/vi/common.json"
import { getAuthenticatedAxios } from "@/lib/server-api"

import type { FriendUser } from "../types"

type FriendCommonLocale = Pick<typeof enCommon, "friends">

interface GlobalUserSearchApiItem {
  id: string
  name: string | null
  email: string
  isFriend: boolean
  friendshipStatus: FriendUser["friendshipStatus"]
  mutualFriendsCount: number
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface SearchUsersResponse {
  data?: GlobalUserSearchApiItem[]
  meta?: PaginationMeta
}

type SearchUsersResult = {
  data: FriendUser[]
  meta: PaginationMeta
}

async function getCommonLocale(): Promise<typeof enCommon> {
  const acceptLanguage = (await headers()).get("accept-language") ?? ""
  return acceptLanguage.toLowerCase().startsWith("vi")
    ? (viCommon as unknown as typeof enCommon)
    : enCommon
}

function createAvatarUrl(seed: string) {
  return `https://i.pravatar.cc/160?u=${encodeURIComponent(seed)}`
}

function getUsernameFromEmail(email: string) {
  return email.split("@")[0] || email
}

function mapUser(
  item: GlobalUserSearchApiItem,
  common: FriendCommonLocale
): FriendUser {
  const fullName = item.name?.trim() || getUsernameFromEmail(item.email)

  return {
    id: item.id,
    username: getUsernameFromEmail(item.email),
    fullName,
    email: item.email,
    avatarUrl: createAvatarUrl(item.id),
    bio: item.isFriend
      ? common.friends.service.friendBio
      : common.friends.service.userBio,
    level: "Beginner",
    location: common.friends.service.location,
    mutualFriends: item.mutualFriendsCount,
    friendshipStatus: item.friendshipStatus,
    isFriend: item.isFriend,
  }
}

function extractResults(
  payload: SearchUsersResponse | GlobalUserSearchApiItem[]
) {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      meta: {
        page: 1,
        limit: payload.length,
        total: payload.length,
        totalPages: 1,
      },
    }
  }

  return {
    data: Array.isArray(payload.data) ? payload.data : [],
    meta: payload.meta ?? { page: 1, limit: 0, total: 0, totalPages: 0 },
  }
}

export async function getFindUsers(params?: {
  q?: string
  page?: number
  limit?: number
}): Promise<SearchUsersResult> {
  const common = await getCommonLocale()
  const client = await getAuthenticatedAxios()
  const response = await client.get<
    SearchUsersResponse | GlobalUserSearchApiItem[]
  >("/api/friends/users/search", {
    params: {
      q: params?.q ?? "",
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    },
  })

  const { data, meta } = extractResults(response.data)

  return {
    data: data.map((item) => mapUser(item, common)),
    meta,
  }
}
