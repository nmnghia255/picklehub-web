"use client"

import { useAtom } from "jotai"
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  CircleAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users2,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchMyNotifications } from "@/features/notifications/actions/user-notifications"
import { cn } from "@/lib/utils"

import type {
  FeedFilter,
  FeedNotification,
  FeedNotificationStatus,
  FeedNotificationType,
} from "../mock-data/feed-notifications"
import { notificationFeedAtom } from "../store/feed-store"

type FeedTypeMeta = {
  label: string
  icon: typeof BellRing
  accentClassName: string
  badgeClassName: string
}

const filterOptions: Array<{ value: FeedFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "unread", label: "Chưa đọc" },
  { value: "invitation", label: "Lời mời" },
  { value: "session", label: "Phiên chơi" },
  { value: "group", label: "Nhóm" },
  { value: "system", label: "Hệ thống" },
]

const feedTypeMeta: Record<FeedNotificationType, FeedTypeMeta> = {
  invitation: {
    label: "Lời mời",
    icon: Users2,
    accentClassName:
      "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-200",
    badgeClassName:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200",
  },
  session: {
    label: "Phiên chơi",
    icon: CalendarDays,
    accentClassName:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  group: {
    label: "Nhóm",
    icon: CircleAlert,
    accentClassName:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-200",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  },
  system: {
    label: "Hệ thống",
    icon: ShieldCheck,
    accentClassName:
      "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-200",
    badgeClassName:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200",
  },
}

function getFilteredNotifications(
  notifications: FeedNotification[],
  activeFilter: FeedFilter
) {
  if (activeFilter === "all") {
    return notifications
  }

  if (activeFilter === "unread") {
    return notifications.filter((notification) => notification.unread)
  }

  return notifications.filter(
    (notification) => notification.type === activeFilter
  )
}

function groupNotificationsBySection(notifications: FeedNotification[]) {
  const sectionOrder = ["Hôm nay", "Hôm qua", "Tuần này"]
  const grouped = new Map<string, FeedNotification[]>()

  notifications.forEach((notification) => {
    const items = grouped.get(notification.section) ?? []
    items.push(notification)
    grouped.set(notification.section, items)
  })

  return sectionOrder
    .filter((section) => grouped.has(section))
    .map((section) => ({
      section,
      items: grouped.get(section) ?? [],
    }))
}

function NotificationAccent({ type }: { type: FeedNotificationType }) {
  const MetaIcon = feedTypeMeta[type].icon

  return (
    <div
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-2xl",
        feedTypeMeta[type].accentClassName
      )}
    >
      <MetaIcon className="size-5" />
    </div>
  )
}

function FeedNotificationCard({
  notification,
  onAccept,
  onDecline,
  onMarkRead,
  onDelete,
}: {
  notification: FeedNotification
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const typeMeta = feedTypeMeta[notification.type]
  const isPendingInvitation =
    notification.type === "invitation" && notification.status === "pending"

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5",
        notification.unread &&
          "border-primary/25 bg-primary/5 shadow-[0_8px_30px_rgb(59,130,246,0.06)]"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <NotificationAccent type={notification.type} />

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base leading-6 font-semibold text-foreground sm:text-lg">
                  {notification.title}
                </h3>
                {notification.unread && (
                  <span className="size-2 rounded-full bg-primary" />
                )}
              </div>

              <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                {notification.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {notification.actor}
                </span>
                <span className="text-muted-foreground/60">•</span>
                <span>{notification.timeLabel}</span>
                <span className="text-muted-foreground/60">•</span>
                <span>{typeMeta.label}</span>
              </div>
            </div>

            <Badge variant="outline" className={typeMeta.badgeClassName}>
              {typeMeta.label}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {notification.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {isPendingInvitation ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDecline(notification.id)}
                  className="sm:flex-none"
                >
                  <XCircle className="size-4" />
                  Từ chối
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAccept(notification.id)}
                  className="sm:flex-none"
                >
                  <CheckCircle2 className="size-4" />
                  Chấp nhận
                </Button>
              </>
            ) : (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="sm:flex-none"
              >
                <Link href={notification.actionHref ?? "/feed"}>
                  <ArrowRight className="size-4" />
                  Xem chi tiết
                </Link>
              </Button>
            )}

            <Button
              size="sm"
              variant={notification.unread ? "secondary" : "ghost"}
              onClick={() => onMarkRead(notification.id)}
              className="sm:flex-none"
            >
              <CheckCheck className="size-4" />
              {notification.unread ? "Đánh dấu đã đọc" : "Đã đọc"}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(notification.id)}
              className="text-muted-foreground hover:text-destructive sm:flex-none"
            >
              <Trash2 className="size-4" />
              Xóa
            </Button>

            {notification.status && notification.type === "invitation" && (
              <Badge
                variant={
                  notification.status === "accepted"
                    ? "default"
                    : notification.status === "declined"
                      ? "destructive"
                      : "outline"
                }
                className="rounded-full"
              >
                {notification.status === "accepted"
                  ? "Đã chấp nhận"
                  : notification.status === "declined"
                    ? "Đã từ chối"
                    : "Đang chờ phản hồi"}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  helper: string
  icon: typeof BellRing
  accent: string
}) {
  return (
    <div className="rounded-2xl border bg-background/80 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-2xl",
            accent
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}

export function FeedPage() {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("all")
  const [notifications, setNotifications] = useAtom(notificationFeedAtom)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const remote = await fetchMyNotifications()
        if (!mounted || !Array.isArray(remote)) return

        // Merge remote notifications into atom (avoid duplicates)
        setNotifications((current) => {
          const byId = new Map(current.map((n) => [n.id, n]))
          remote.forEach((r) => {
            if (!byId.has(r.id)) byId.set(r.id, r)
          })
          return Array.from(byId.values()).sort((a, b) =>
            b.timeLabel > a.timeLabel ? 1 : -1
          )
        })
      } catch (err) {
        console.error("Failed to load remote notifications:", err)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [setNotifications])

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length
  const pendingInviteCount = notifications.filter(
    (notification) =>
      notification.type === "invitation" && notification.status === "pending"
  ).length
  const upcomingSessionCount = notifications.filter(
    (notification) => notification.type === "session"
  ).length

  const visibleNotifications = getFilteredNotifications(
    notifications,
    activeFilter
  )
  const groupedNotifications = groupNotificationsBySection(visibleNotifications)

  const handleMarkRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    )
  }

  const handleMarkAllRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false }))
    )
  }

  const handleDeleteReadNotifications = () => {
    setNotifications((current) =>
      current.filter((notification) => notification.unread)
    )
  }

  const handleDeleteNotification = (id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    )
  }

  const handleResolveInvitation = (
    id: string,
    status: FeedNotificationStatus
  ) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false, status }
          : notification
      )
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-b from-background via-background to-muted/25">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="relative overflow-hidden rounded-3xl border bg-linear-to-br from-slate-950 via-slate-900 to-indigo-900 p-6 text-white shadow-[0_25px_80px_rgba(15,23,42,0.35)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_30%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_38%,rgba(255,255,255,0.03))]" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
                <BellRing className="size-3.5" />
                Trung tâm thông báo
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Bảng tin hoạt động gần đây
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                  Tập trung mọi lời mời, nhắc lịch, cập nhật nhóm và thông báo
                  hệ thống vào một nơi để bạn xử lý nhanh hơn.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:max-w-2xl lg:min-w-120">
              <StatCard
                label="Chưa đọc"
                value={unreadCount}
                helper="Cần xem trong hôm nay"
                icon={BellRing}
                accent="bg-white/10 text-white"
              />
              <StatCard
                label="Lời mời chờ"
                value={pendingInviteCount}
                helper="Có thể phản hồi ngay"
                icon={Users2}
                accent="bg-white/10 text-white"
              />
              <StatCard
                label="Phiên chơi"
                value={upcomingSessionCount}
                helper="Nhắc lịch sắp diễn ra"
                icon={CalendarDays}
                accent="bg-white/10 text-white"
              />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Card className="border-muted/60 bg-background/85 p-5 shadow-sm backdrop-blur sm:p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm font-medium tracking-[0.24em] text-muted-foreground uppercase">
                    Danh sách thông báo
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {visibleNotifications.length} thông báo đang hiển thị trong
                    bộ lọc hiện tại.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleMarkAllRead}
                    className="whitespace-nowrap"
                  >
                    <CheckCheck className="size-4" />
                    Đánh dấu tất cả đã đọc
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteReadNotifications}
                    disabled={notifications.every(
                      (notification) => notification.unread
                    )}
                    className="whitespace-nowrap"
                  >
                    <Trash2 className="size-4" />
                    Xóa tất cả đã đọc
                  </Button>
                </div>
              </div>

              <div className="mt-5">
                <Tabs
                  value={activeFilter}
                  onValueChange={(value) =>
                    setActiveFilter(value as FeedFilter)
                  }
                >
                  <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
                    {filterOptions.map((option) => {
                      const badgeCount =
                        option.value === "all"
                          ? notifications.length
                          : option.value === "unread"
                            ? unreadCount
                            : notifications.filter(
                                (notification) =>
                                  notification.type === option.value
                              ).length

                      return (
                        <TabsTrigger
                          key={option.value}
                          value={option.value}
                          className="rounded-full border border-border/70 bg-muted/40 px-4 py-2 text-sm shadow-none data-[state=active]:border-primary/30 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          {option.label}
                          <Badge
                            variant="secondary"
                            className="ml-1 rounded-full px-2 py-0 text-[10px] font-semibold"
                          >
                            {badgeCount}
                          </Badge>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </Tabs>
              </div>
            </Card>

            {groupedNotifications.length > 0 ? (
              <div className="space-y-6">
                {groupedNotifications.map((group) => (
                  <section key={group.section} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                        {group.section}
                      </h3>
                      <div className="h-px flex-1 bg-border" />
                      <Badge variant="outline" className="rounded-full">
                        {group.items.length}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {group.items.map((notification) => (
                        <FeedNotificationCard
                          key={notification.id}
                          notification={notification}
                          onAccept={(id) =>
                            handleResolveInvitation(id, "accepted")
                          }
                          onDecline={(id) =>
                            handleResolveInvitation(id, "declined")
                          }
                          onMarkRead={handleMarkRead}
                          onDelete={handleDeleteNotification}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <Card className="p-10">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <BellRing className="size-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Không có thông báo phù hợp
                    </h3>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Bộ lọc hiện tại chưa có dữ liệu. Bạn có thể quay về toàn
                      bộ thông báo để xem lại các cập nhật gần đây.
                    </p>
                  </div>
                  <Button onClick={() => setActiveFilter("all")}>
                    Xem tất cả thông báo
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Card className="p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Hành động nhanh</h3>
                  <p className="text-sm text-muted-foreground">
                    Xử lý những việc bạn cần làm ngay.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border p-3">
                  <div>
                    <p className="text-sm font-medium">Lời mời đang chờ</p>
                    <p className="text-xs text-muted-foreground">
                      Phản hồi ngay trong bảng tin
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {pendingInviteCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-2xl border p-3">
                  <div>
                    <p className="text-sm font-medium">Nhắc lịch sắp diễn ra</p>
                    <p className="text-xs text-muted-foreground">
                      Phiên chơi và sự kiện
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {upcomingSessionCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-2xl border p-3">
                  <div>
                    <p className="text-sm font-medium">Thông báo chưa đọc</p>
                    <p className="text-xs text-muted-foreground">
                      Nên xử lý trước khi thoát
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {unreadCount}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Quy ước bảng tin</h3>
                  <p className="text-sm text-muted-foreground">
                    Màu sắc giúp phân biệt loại thông báo.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                {Object.values(feedTypeMeta).map((meta) => {
                  const Icon = meta.icon

                  return (
                    <div
                      key={meta.label}
                      className="flex items-center gap-3 rounded-2xl border p-3"
                    >
                      <div
                        className={cn(
                          "flex size-9 items-center justify-center rounded-xl",
                          meta.accentClassName
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {meta.label}
                        </p>
                        <p className="text-xs">
                          Thông báo cùng loại sẽ dùng cùng sắc thái.
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
