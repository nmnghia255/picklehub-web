"use client"

import type { TFunction } from "i18next"
import { Bell, Clock } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface GroupFeedNotificationItem {
  id: string
  groupId?: string
  title: string
  message: string
  sentAt: string
  timeLabel?: string
  senderName: string
}

interface GroupFeedNotificationsProps {
  notifications?: GroupFeedNotificationItem[]
  isLoading?: boolean
}

function formatDate(
  dateString: string,
  t: TFunction<"common">,
  language?: string
): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return t("notifications.groupFeed.time.justNow")
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t("notifications.groupFeed.time.justNow")
  if (diffMins < 60)
    return t("notifications.groupFeed.time.minutesAgo", {
      count: diffMins,
    })
  if (diffHours < 24)
    return t("notifications.groupFeed.time.hoursAgo", {
      count: diffHours,
    })
  if (diffDays < 7)
    return t("notifications.groupFeed.time.daysAgo", {
      count: diffDays,
    })

  return date.toLocaleDateString(
    language?.startsWith("vi") ? "vi-VN" : language || undefined
  )
}

export function GroupFeedNotifications({
  notifications = [],
  isLoading = false,
  className = "",
}: GroupFeedNotificationsProps & { className?: string }) {
  const { t, i18n } = useTranslation("common")

  if (isLoading) {
    return (
      <Card className={"group-feature-root mt-6 " + className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-5" />
            {t("notifications.groupFeed.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t("notifications.groupFeed.loading")}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card className={"group-feature-root mt-6 " + className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-5" />
            {t("notifications.groupFeed.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t(
              "notifications.groupFeed.empty",
              "Chưa có thông báo nào được gửi tới nhóm"
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`group-feature-root mt-6 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-5" />
          {t("notifications.groupFeed.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-r-lg border-l-2 border-emerald-500/50 py-2 pl-4 transition-colors hover:bg-muted/50"
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="line-clamp-2 text-sm leading-tight font-semibold">
                    {notification.title}
                  </h4>
                  <Badge
                    variant="outline"
                    className="text-xs whitespace-nowrap"
                  >
                    <Clock className="mr-1 size-3" />
                    {notification.timeLabel ??
                      formatDate(notification.sentAt, t, i18n.language)}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/60">
                  {t("notifications.senderPrefix", "Từ:")}{" "}
                  <span className="font-medium">{notification.senderName}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
