"use server"

import axios from "axios"
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
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const common = getNotificationsCommonSection(await getCommonLocale())
    const authenticatedAxios = await getAuthenticatedAxios()
    const response = await authenticatedAxios.post(
      `/api/groups/${dto.groupId}/notify`,
      {
        title: dto.title,
        message: dto.message,
      }
    )

    return {
      success: true,
      message:
        (response.data?.message as string | undefined) ??
        common.sender.success.description,
    }
  } catch (error) {
    const common = getNotificationsCommonSection(await getCommonLocale())
    let errorMessage = common.sender.error.generic
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || errorMessage
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    console.error("Error sending group feed notification:", error)
    return {
      success: false,
      error: errorMessage,
    }
  }
}
