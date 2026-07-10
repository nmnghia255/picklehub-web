"use server"

import { headers } from "next/headers"

import type {
  FeedNotification,
  FeedNotificationType,
} from "@/features/feed/types"
import enCommon from "@/i18n/locales/en/common.json"
import viCommon from "@/i18n/locales/vi/common.json"
import { getAuthenticatedAxios } from "@/lib/server-api"

function getCommonLocale() {
  const acceptLanguage = headers().get("accept-language") ?? ""
  return acceptLanguage.toLowerCase().startsWith("vi") ? viCommon : enCommon
}

/**
 * Fetch notifications for the current user from the backend notification service
 * Returns an array compatible with the feed notification shape used in the UI
 */
export async function fetchMyNotifications(): Promise<FeedNotification[]> {
  try {
    const common = getCommonLocale()
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
          if (mins < 1440) return "today"
          if (mins < 10080) return "thisWeek"
          return "yesterday"
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
          title: (it["title"] ??
            it["subject"] ??
            common.notifications.defaults.title) as string,
          description: (it["message"] ?? it["description"] ?? "") as string,
          actor: (it["actorName"] ??
            it["sender"] ??
            common.notifications.defaults.actor) as string,
          timeLabel: new Date(
            (it["createdAt"] ?? it["sentAt"] ?? Date.now()) as string | number
          ).toLocaleString(),
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
