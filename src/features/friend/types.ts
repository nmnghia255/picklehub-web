export type TabKey = "find" | "sent" | "received" | "friends"
export type SortKey = "alphabet" | "friendTime" | "inviteTime"

export type FriendUser = {
  id: string
  username: string
  fullName: string
  avatarUrl: string
  bio: string
  level: "Beginner" | "Intermediate" | "Advanced"
  location: string
  mutualFriends: number
  invitedAt?: string
  becameFriendAt?: string
  lastActiveAt?: string
  preferredTime?: string
  inviteSource?: string
  inviteMessage?: string
  lastMatchAt?: string
  friendshipSinceLabel?: string
}
