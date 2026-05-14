"use client"

import { Bell, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface GroupFeedNotificationItem {
  id: string
  title: string
  message: string
  sentAt: string
  senderName: string
}

interface GroupFeedNotificationsProps {
  notifications?: GroupFeedNotificationItem[]
  isLoading?: boolean
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Vừa xong"
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`

  return date.toLocaleDateString("vi-VN")
}

export function GroupFeedNotifications({
  notifications = [],
  isLoading = false,
  className = "",
}: GroupFeedNotificationsProps & { className?: string }) {
  if (isLoading) {
    return (
      <Card className={"mt-6 " + className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-5" />
            Thông báo nhóm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">
            Đang tải thông báo...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card className={"mt-6 " + className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-5" />
            Thông báo nhóm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">
            Chưa có thông báo nào được gửi tới nhóm
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={"mt-6 " + className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-5" />
          Thông báo nhóm ({notifications.length})
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
                    {formatDate(notification.sentAt)}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/60">
                  Từ:{" "}
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
