"use client"

import { Bell, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatDate(dateString: string, t: any, language?: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return t("notifications.justNow", "Vừa xong")
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t("notifications.justNow", "Vừa xong")
  if (diffMins < 60)
    return t("notifications.minutesAgo", "{{count}} phút trước", {
      count: diffMins,
    })
  if (diffHours < 24)
    return t("notifications.hoursAgo", "{{count}} giờ trước", {
      count: diffHours,
    })
  if (diffDays < 7)
    return t("notifications.daysAgo", "{{count}} ngày trước", {
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
  const { t, i18n } = useGroupsTranslation()

  if (isLoading) {
    return (
      <Card className={"mt-6 " + className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-5" />
            {t("notifications.title", "Thông báo nhóm")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t("notifications.loading", "Đang tải thông báo...")}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card className={"mt-6 bg-orange-50 dark:bg-accent" + className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-5" />
            {t("notifications.title", "Thông báo nhóm")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t(
              "notifications.empty",
              "Chưa có thông báo nào được gửi tới nhóm"
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`mt-6 ${className} bg-orange-50 dark:bg-accent`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-5" />
          {t("notifications.title", "Thông báo nhóm")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-r-lg border-l-2 border-primary/50 py-2 pl-4 transition-colors hover:bg-muted/50"
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
