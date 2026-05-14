import { getAuthenticatedAxios } from "@/lib/server-api"

import type {
  SendGroupFeedNotificationDto,
  SendGroupFeedNotificationResponse,
  SendInAppNotificationDto,
  SendInAppNotificationResponse,
} from "../types"

/**
 * Send a group feed notification to all members of a group
 * @param dto - The group feed notification data
 * @returns Response from the notification service
 */
export async function sendGroupFeedNotification(
  dto: SendGroupFeedNotificationDto
): Promise<SendGroupFeedNotificationResponse> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<SendGroupFeedNotificationResponse>(
    "/api/notifications/feed",
    {
      groupId: dto.groupId,
      title: dto.title,
      message: dto.message,
    }
  )
  return response.data
}

/**
 * Send an in-app notification to specific users
 * @param dto - The in-app notification data
 * @returns Response from the notification service
 */
export async function sendInAppNotification(
  dto: SendInAppNotificationDto
): Promise<SendInAppNotificationResponse> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<SendInAppNotificationResponse>(
    "/api/notifications/send",
    {
      userIds: dto.userIds,
      title: dto.title,
      message: dto.message,
    }
  )
  return response.data
}

/**
 * Send an email notification
 * @param to - Recipient email
 * @param subject - Email subject
 * @param htmlContent - Email HTML content
 * @returns Response from the notification service
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  htmlContent: string
): Promise<{ message: string }> {
  const axios = await getAuthenticatedAxios()
  const response = await axios.post<{ message: string }>(
    "/api/notifications/email/send",
    {
      to,
      subject,
      htmlContent,
    }
  )
  return response.data
}
