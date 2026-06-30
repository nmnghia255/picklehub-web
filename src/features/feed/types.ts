export type FeedFilter =
  | "all"
  | "unread"
  | "invitation"
  | "session"
  | "group"
  | "system"

export type FeedNotificationType = "invitation" | "session" | "group" | "system"

export type FeedNotificationStatus = "pending" | "accepted" | "declined"

export interface FeedNotification {
  id: string
  type: FeedNotificationType
  groupId?: string
  section: string
  title: string
  description: string
  actor: string
  timeLabel: string
  unread: boolean
  status?: FeedNotificationStatus
  tags: string[]
  actionHref?: string
}
