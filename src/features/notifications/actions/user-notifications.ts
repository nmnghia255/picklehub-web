"use server"

import type {
  FeedNotification,
  FeedNotificationType,
} from "@/features/feed/types"
import { getAuthenticatedAxios } from "@/lib/server-api"

/**
 * Fetch notifications for the current user from the backend notification service
 * Returns an array compatible with the feed notification shape used in the UI
 */
export async function fetchMyNotifications(): Promise<FeedNotification[]> {
  try {
    const axios = await getAuthenticatedAxios()
    const res = await axios.get("/api/notification")

    const payload = res.data

    if (!payload) return []

    const items = Array.isArray(payload) ? payload : (payload.data ?? [])

    // Map backend notification shape to FeedNotification used in UI
    const mapped: FeedNotification[] = items.map(
      (it: Record<string, unknown>) => {
        const type =
          (it["type"] as FeedNotificationType) ||
          (it["category"] as FeedNotificationType) ||
          "system"

        const section = (() => {
          // Simple heuristic by date
          const created = new Date(
            (it["createdAt"] ?? it["sentAt"] ?? Date.now()) as string | number
          )
          const now = new Date()
          const diff = now.getTime() - created.getTime()
          const mins = Math.floor(diff / 60000)
          if (mins < 60) return "Hôm nay"
          if (mins < 1440) return "Hôm nay"
          if (mins < 10080) return "Tuần này"
          return "Hôm qua"
        })()

        return {
          id: String(
            it["id"] ?? it["_id"] ?? Math.random().toString(36).slice(2, 9)
          ),
          type,
          groupId: (it["groupId"] ?? it["group_id"] ?? undefined) as
            | string
            | undefined,
          section,
          title: (it["title"] ?? it["subject"] ?? "Thông báo") as string,
          description: (it["message"] ?? it["description"] ?? "") as string,
          actor: (it["actorName"] ?? it["sender"] ?? "Hệ thống") as string,
          timeLabel: new Date(
            (it["createdAt"] ?? it["sentAt"] ?? Date.now()) as string | number
          ).toLocaleString("vi-VN"),
          unread:
            it["read"] === false ||
            it["isRead"] === false ||
            it["unread"] === true,
          status: (it["status"] ?? undefined) as undefined | string,
          tags: Array.isArray(it["tags"]) ? (it["tags"] as string[]) : [],
          actionHref: (it["actionHref"] ?? it["url"] ?? undefined) as
            | string
            | undefined,
        }
      }
    )

    return mapped
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[notifications] fetchMyNotifications failed:", error)
    }
    return []
  }
}
