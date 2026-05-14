"use client"

import { useGroupFeedNotifications } from "@/features/notifications/hooks/use-group-feed-notifications"

import { GroupFeedNotifications } from "./group-feed-notifications"

interface GroupFeedNotificationsContainerProps {
  groupId: string
}

export function GroupFeedNotificationsContainer({
  groupId,
}: GroupFeedNotificationsContainerProps) {
  const { notifications, isLoading } = useGroupFeedNotifications(groupId)

  return (
    <GroupFeedNotifications
      notifications={notifications}
      isLoading={isLoading}
    />
  )
}
