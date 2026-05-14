"use server"

import { getAuthenticatedAxios } from "@/lib/server-api"

import type { GroupFeedNotificationItem } from "../components/group-feed-notifications"
import type { SendGroupFeedNotificationDto } from "../types"

/**
 * Server action to fetch group feed notifications
 * This runs on the server and can safely access authenticated axios
 */
export async function fetchGroupFeedNotifications(
  groupId: string
): Promise<GroupFeedNotificationItem[]> {
  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.get(
      `/api/groups/${groupId}/feed-notifications`
    )

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.data || []

    return data as GroupFeedNotificationItem[]
  } catch (error) {
    // Return empty array if endpoint doesn't exist or other errors
    console.error("Error fetching group feed notifications:", error)
    return []
  }
}

/**
 * Server action to send a group feed notification
 * This runs on the server and can safely access authenticated axios
 */
export async function sendGroupFeedNotificationAction(
  dto: SendGroupFeedNotificationDto
): Promise<{ success: boolean; message: string }> {
  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post("/api/notifications/feed", {
      groupId: dto.groupId,
      title: dto.title,
      message: dto.message,
    })

    return {
      success: true,
      message: response.data?.message || "Thông báo đã được gửi thành công",
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Không thể gửi thông báo"
    console.error("Error sending group feed notification:", error)
    throw new Error(errorMessage)
  }
}
