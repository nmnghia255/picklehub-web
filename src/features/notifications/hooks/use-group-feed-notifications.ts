"use client"

import { useAtomValue } from "jotai"
import { useMemo } from "react"

import type { GroupFeedNotificationItem } from "../components/group-feed-notifications"
import { groupFeedNotificationsAtom } from "../store/group-feed-store"

export function useGroupFeedNotifications(groupId: string) {
  const notifications = useAtomValue(groupFeedNotificationsAtom)

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (!notification.groupId) return true
      return notification.groupId === groupId
    })
  }, [groupId, notifications])

  return {
    notifications: filteredNotifications as GroupFeedNotificationItem[],
    isLoading: false,
    error: null,
    refresh: () => undefined,
  }
}
