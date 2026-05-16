/**
 * Notification types and interfaces
 */

export interface SendGroupFeedNotificationDto {
  groupId: string
  title: string
  message: string
}

export interface SendGroupFeedNotificationResponse {
  message: string
  data?: {
    groupId: string
    title: string
    message: string
  }
}

export interface SendInAppNotificationDto {
  userIds: string[]
  title: string
  message: string
}

export interface SendInAppNotificationResponse {
  message: string
  data?: {
    userIds: string[]
    title: string
    message: string
  }
}

export interface NotificationError {
  message: string
  statusCode?: number
  error?: string
}
