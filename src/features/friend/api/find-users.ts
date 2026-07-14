import { headers } from "next/headers"

import { type CommonLocale, getFriendCommonSection } from "@/i18n/common-locale"
import { getAuthenticatedAxios } from "@/lib/server-api"

import type { FriendUser } from "../types"

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

function mapUser(
  item: GlobalUserSearchApiItem,
  common: ReturnType<typeof getFriendCommonSection>
): FriendUser {
  const fullName = item.name?.trim() || getUsernameFromEmail(item.email)

  return {
    id: item.id,
    username: getUsernameFromEmail(item.email),
    fullName,
    email: item.email,
    avatarUrl: createAvatarUrl(item.id),
    bio: item.isFriend ? common.service.friendBio : common.service.userBio,
    level: "Beginner",
    location: common.service.location,
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
  const common = getFriendCommonSection(await getCommonLocale())
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
