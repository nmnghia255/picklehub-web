"use server"

import { headers } from "next/headers"

import type {
  FeedNotification,
  FeedNotificationType,
} from "@/features/feed/types"
import {
  type CommonLocale,
  getNotificationsCommonSection,
} from "@/i18n/common-locale"
import { getAuthenticatedAxios } from "@/lib/server-api"

import { deriveNotificationActionHref } from "../utils/notification-click-target"

async function getCommonLocale(): Promise<CommonLocale> {
  const acceptLanguage = (await headers()).get("accept-language") ?? ""
  const { default: enCommon } = await import("@/i18n/locales/en/common.json")
  const { default: viCommon } = await import("@/i18n/locales/vi/common.json")

  return acceptLanguage.toLowerCase().startsWith("vi") ? viCommon : enCommon
}

/**
 * Fetch notifications for the current user from the backend notification service
 * Returns an array compatible with the feed notification shape used in the UI
 */
export async function fetchMyNotifications(): Promise<FeedNotification[]> {
  try {
    const common = getNotificationsCommonSection(await getCommonLocale())
    const axios = await getAuthenticatedAxios()
    const res = await axios.get("/api/notification")

    const payload = res.data

    if (!payload) return []

    const items = Array.isArray(payload) ? payload : (payload.data ?? [])

    const mapped: FeedNotification[] = items.map(
      (it: Record<string, unknown>) => {
        const metadata = it["metadata"]
        const rawType = String(it["type"] ?? it["category"] ?? "")
        const type: FeedNotificationType = (
          ["invitation", "session", "group", "system"] as const
        ).includes(rawType as FeedNotificationType)
          ? (rawType as FeedNotificationType)
          : "system"

        const section = (() => {
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
          title:
            typeof (it["title"] ?? it["subject"]) === "string" &&
            String(it["title"] ?? it["subject"]).trim()
              ? String(it["title"] ?? it["subject"])
              : common.defaults.title,
          description:
            typeof (it["message"] ?? it["description"]) === "string" &&
            String(it["message"] ?? it["description"]).trim()
              ? String(it["message"] ?? it["description"])
              : common.defaults.description,
          actor:
            typeof (it["actorName"] ?? it["sender"]) === "string" &&
            String(it["actorName"] ?? it["sender"]).trim()
              ? String(it["actorName"] ?? it["sender"])
              : common.defaults.actor,
          timeLabel: new Date(
            (it["createdAt"] ?? it["sentAt"] ?? Date.now()) as string | number
          ).toLocaleString(),
          unread:
            it["read"] === false ||
            it["isRead"] === false ||
            it["unread"] === true,
          status: (it["status"] ?? undefined) as undefined | string,
          tags: Array.isArray(it["tags"]) ? (it["tags"] as string[]) : [],
          actionHref: (it["actionHref"] ??
            it["url"] ??
            deriveNotificationActionHref(metadata)) as string | undefined,
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

export async function markUserNotificationsRead(notificationIds: string[]) {
  const axios = await getAuthenticatedAxios()
  const common = getNotificationsCommonSection(await getCommonLocale())

  if (notificationIds.length === 0) {
    return {
      success: true,
      message: common.defaults.title,
    }
  }

  const response = await axios.patch("/api/notifications/read", {
    ids: notificationIds,
  })

  return response.data
}
