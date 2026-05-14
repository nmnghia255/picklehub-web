"use client"

import { useEffect, useState } from "react"

import { fetchGroupFeedNotifications } from "../actions/notifications"
import type { GroupFeedNotificationItem } from "../components/group-feed-notifications"

export function useGroupFeedNotifications(groupId: string) {
  const [notifications, setNotifications] = useState<
    GroupFeedNotificationItem[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await fetchGroupFeedNotifications(groupId)
        setNotifications(data)
      } catch (err) {
        // Silently handle errors
        setNotifications([])
        if (err instanceof Error) {
          setError(err)
          console.error("Error fetching group notifications:", err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (groupId) {
      loadNotifications()
    }
  }, [groupId])

  return { notifications, isLoading, error }
}
