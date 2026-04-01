import type { FriendUser, SortKey } from "./types"

function toDateValue(value?: string) {
  return value ? new Date(value).getTime() : 0
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function formatDate(value?: string) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function sortUsers(users: FriendUser[], sortBy: SortKey) {
  return [...users].sort((a, b) => {
    if (sortBy === "alphabet") {
      return a.username.localeCompare(b.username)
    }

    if (sortBy === "friendTime") {
      return toDateValue(b.becameFriendAt) - toDateValue(a.becameFriendAt)
    }

    return toDateValue(b.invitedAt) - toDateValue(a.invitedAt)
  })
}

export function filterUsersByUsername(users: FriendUser[], keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase()

  return users.filter((user) =>
    user.username.toLowerCase().includes(normalizedKeyword)
  )
}
