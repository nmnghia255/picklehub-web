import axios from "axios"

import { getSession } from "@/lib/session"

import type { FriendUser } from "../types"

interface AuthUserItem {
  id: string
  name: string | null
  email: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""
const INTERNAL_TOKEN =
  process.env.AUTH_INTERNAL_TOKEN || "your-auth-internal-token-here"

function createAvatarUrl(seed: string) {
  return `https://i.pravatar.cc/160?u=${encodeURIComponent(seed)}`
}

function getUsernameFromEmail(email: string) {
  return email.split("@")[0] || email
}

function mapUser(item: AuthUserItem): FriendUser {
  const fullName = item.name?.trim() || getUsernameFromEmail(item.email)

  return {
    id: item.id,
    username: getUsernameFromEmail(item.email),
    fullName,
    avatarUrl: createAvatarUrl(item.id),
    bio: "Người dùng trên hệ thống",
    level: "Beginner",
    location: "Chưa cập nhật",
    mutualFriends: 0,
  }
}

export async function getFindUsers(): Promise<FriendUser[]> {
  const session = await getSession()

  if (!session.user?.id) {
    return []
  }

  const response = await axios.get<{ data?: AuthUserItem[] } | AuthUserItem[]>(
    `${API_BASE_URL}/api/auth/internal/users`,
    {
      params: { q: "", page: 1, limit: 100 },
      headers: {
        "x-internal-token": INTERNAL_TOKEN,
      },
    }
  )

  const users = Array.isArray(response.data)
    ? response.data
    : (response.data.data ?? [])

  return users.filter((user) => user.id !== session.user?.id).map(mapUser)
}
