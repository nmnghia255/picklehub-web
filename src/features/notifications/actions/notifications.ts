"use server"

import { getAuthenticatedAxios } from "@/lib/server-api"

import type { SendGroupFeedNotificationDto } from "../types"

/**
 * Server action to send a group feed notification
 * This runs on the server and can safely access authenticated axios
 */
export async function sendGroupFeedNotificationAction(
  dto: SendGroupFeedNotificationDto
): Promise<{ success: boolean; message: string }> {
  try {
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(`/api/groups/${dto.groupId}/notify`, {
      title: dto.title,
      message: dto.message,
    })

    return {
      success: true,
      message: response.data?.message || "Notification sent successfully",
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Could not send the notification"
    console.error("Error sending group feed notification:", error)
    throw new Error(errorMessage)
  }
}
