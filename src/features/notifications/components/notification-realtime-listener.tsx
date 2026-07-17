"use client"

import { useSetAtom } from "jotai"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { io } from "socket.io-client"
import { toast } from "sonner"

import { useSession } from "@/features/auth/hooks/use-session"
import { notificationFeedAtom } from "@/features/feed/store/feed-store"
import type {
  FeedNotification,
  FeedNotificationType,
} from "@/features/feed/types"

import { deriveNotificationActionHref } from "../utils/notification-click-target"

interface RealtimeNotificationPayload {
  id: string
  userId: string
  title: string
  message: string
  metadata?: unknown
  isRead: boolean
  createdAt: string
}

function getSocketBaseUrl() {
  const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""
  return gatewayUrl.replace(/\/$/, "")
}

function getNotificationType(metadata: unknown): FeedNotificationType {
  if (!metadata || typeof metadata !== "object") return "system"

  const onClickSupport = (metadata as Record<string, unknown>).onClickSupport
  if (!onClickSupport || typeof onClickSupport !== "object") return "system"

  const type = (onClickSupport as Record<string, unknown>).type
  if (type === "group") return "group"
  if (type === "session") return "session"
  if (type === "invitation") return "invitation"

  return "system"
}

function mapRealtimeNotification(
  payload: RealtimeNotificationPayload
): FeedNotification {
  return {
    id: payload.id,
    type: getNotificationType(payload.metadata),
    section: "today",
    title: payload.title,
    description: payload.message,
    actor: "PickleHub",
    timeLabel: new Date(payload.createdAt).toLocaleString(),
    unread: !payload.isRead,
    tags: [],
    actionHref: deriveNotificationActionHref(payload.metadata),
  }
}

export function NotificationRealtimeListener() {
  const session = useSession()
  const router = useRouter()
  const setNotifications = useSetAtom(notificationFeedAtom)

  useEffect(() => {
    if (!session?.accessToken) return

    const baseUrl = getSocketBaseUrl()
    if (!baseUrl) return

    const socket = io(`${baseUrl}/notifications`, {
      path: "/notification.io/",
      auth: {
        token: session.accessToken,
      },
      transports: ["websocket"],
      reconnection: true,
    })

    socket.on(
      "notification-created",
      (payload: RealtimeNotificationPayload) => {
        const notification = mapRealtimeNotification(payload)

        setNotifications((current) => {
          if (current.some((item) => item.id === notification.id)) {
            return current
          }

          return [notification, ...current]
        })

        toast(notification.title, {
          description: notification.description,
          action: {
            label: "View",
            onClick: () => router.push(notification.actionHref ?? "/feed"),
          },
        })
      }
    )

    return () => {
      socket.removeAllListeners()
      socket.close()
    }
  }, [router, session?.accessToken, setNotifications])

  return null
}
