import { atom } from "jotai"

import { feedNotifications } from "@/features/feed/mock-data/feed-notifications"

import type { GroupFeedNotificationItem } from "../components/group-feed-notifications"

function buildInitialGroupFeedNotifications(): GroupFeedNotificationItem[] {
  return feedNotifications
    .filter((notification) => notification.type === "group")
    .map((notification) => ({
      id: notification.id,
      groupId: notification.groupId,
      title: notification.title,
      message: notification.description,
      sentAt: new Date().toISOString(),
      timeLabel: notification.timeLabel,
      senderName: notification.actor,
    }))
}

export const groupFeedNotificationsAtom = atom<GroupFeedNotificationItem[]>(
  buildInitialGroupFeedNotifications()
)
