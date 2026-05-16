// Export notification service functions
export {
  sendEmailNotification,
  sendGroupFeedNotification,
  sendInAppNotification,
} from "./api/notification-service"

// Export notification types
export type {
  NotificationError,
  SendGroupFeedNotificationDto,
  SendGroupFeedNotificationResponse,
  SendInAppNotificationDto,
  SendInAppNotificationResponse,
} from "./types"

// Export notification components
export { GroupFeedNotificationSender } from "./components/group-feed-notification-sender"
export type { GroupFeedNotificationItem } from "./components/group-feed-notifications"
export { GroupFeedNotifications } from "./components/group-feed-notifications"

// Export server actions
export {
  fetchGroupFeedNotifications,
  sendGroupFeedNotificationAction,
} from "./actions/notifications"

// Export hooks
export { useGroupFeedNotifications } from "./hooks/use-group-feed-notifications"
