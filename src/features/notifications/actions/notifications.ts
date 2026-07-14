"use server"

import { headers } from "next/headers"

import {
  type CommonLocale,
  getNotificationsCommonSection,
} from "@/i18n/common-locale"
import { getAuthenticatedAxios } from "@/lib/server-api"

import type { SendGroupFeedNotificationDto } from "../types"

async function getCommonLocale(): Promise<CommonLocale> {
  const acceptLanguage = (await headers()).get("accept-language") ?? ""
  const { default: enCommon } = await import("@/i18n/locales/en/common.json")
  const { default: viCommon } = await import("@/i18n/locales/vi/common.json")

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
    const common = getNotificationsCommonSection(await getCommonLocale())
    const axios = await getAuthenticatedAxios()
    const response = await axios.post(`/api/groups/${dto.groupId}/notify`, {
      title: dto.title,
      message: dto.message,
    })

    return {
      success: true,
      message:
        (response.data?.message as string | undefined) ??
        common.sender.success.description,
    }
  } catch (error) {
    const common = getNotificationsCommonSection(await getCommonLocale())
    const errorMessage =
      error instanceof Error ? error.message : common.sender.error.generic
    console.error("Error sending group feed notification:", error)
    throw new Error(errorMessage)
  }
}
