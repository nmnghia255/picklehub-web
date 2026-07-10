"use server"

import { headers } from "next/headers"

import enCommon from "@/i18n/locales/en/common.json"
import viCommon from "@/i18n/locales/vi/common.json"
import { getAuthenticatedAxios } from "@/lib/server-api"

import type { SendGroupFeedNotificationDto } from "../types"

function getCommonLocale() {
  const acceptLanguage = headers().get("accept-language") ?? ""
  return acceptLanguage.toLowerCase().startsWith("vi") ? viCommon : enCommon
}

/**
 * Server action to send a group feed notification
 * This runs on the server and can safely access authenticated axios
 */
export async function sendGroupFeedNotificationAction(
  dto: SendGroupFeedNotificationDto
): Promise<{ success: boolean; message: string }> {
  try {
    const common = getCommonLocale()
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(`/api/groups/${dto.groupId}/notify`, {
      title: dto.title,
      message: dto.message,
    })

    return {
      success: true,
      message:
        (response.data?.message as string | undefined) ??
        common.notifications.sender.success.description,
    }
  } catch (error) {
    const common = getCommonLocale()
    const errorMessage =
      error instanceof Error
        ? error.message
        : common.notifications.sender.error.generic
    console.error("Error sending group feed notification:", error)
    throw new Error(errorMessage)
  }
}
