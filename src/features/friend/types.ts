export type TabKey = "find" | "sent" | "received" | "friends"
export type SortKey = "alphabet" | "friendTime" | "inviteTime"
export type FriendshipStatus =
  | "NONE"
  | "FRIEND"
  | "REQUEST_SENT"
  | "REQUEST_RECEIVED"

export type FriendUser = {
  id: string
  username: string
  fullName: string
  email?: string
  avatarUrl: string
  bio: string
  level: "Beginner" | "Intermediate" | "Advanced"
  location: string
  mutualFriends: number
  friendshipStatus?: FriendshipStatus
  isFriend?: boolean
  counterpartId?: string
  invitedAt?: string
  becameFriendAt?: string
  lastActiveAt?: string
  preferredTime?: string
  inviteSource?: string
  inviteMessage?: string
  lastMatchAt?: string
  friendshipSinceLabel?: string
}
