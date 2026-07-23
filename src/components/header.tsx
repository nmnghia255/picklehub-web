"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAtom } from "jotai"
import {
  BellRing,
  CheckCheck,
  CheckCircle2,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useLayoutEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { LanguageSwitcher } from "@/components/language-switcher"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notificationFeedAtom } from "@/features/feed/store/feed-store"
import { markUserNotificationsRead } from "@/features/notifications/actions/user-notifications"
import type { SessionUser } from "@/lib/session"

export interface HeaderProps {
  user: SessionUser
}

export function Header({ user }: HeaderProps) {
  const { t } = useTranslation("common")
  const queryClient = useQueryClient()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useAtom(notificationFeedAtom)

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["session"] })
        router.push("/login")
      }
    } catch (error) {
      console.error("Đăng xuất thất bại:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const { data: userProfile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const res = await fetch("/api/users/me")
      if (!res.ok) return null
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
  })

  const activeAvatarUrl =
    userProfile?.avatarUrl ??
    userProfile?.avatar_url ??
    userProfile?.avatar ??
    user.avatarUrl ??
    undefined

  const displayName =
    userProfile?.fullName ??
    userProfile?.name ??
    user.name ??
    user.email?.split("@")[0] ??
    t("header.defaultUser")

  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase() ?? "")
    .join("")

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length

  const handleMarkRead = (notificationId: string) => {
    const previousNotifications = notifications

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, unread: false }
          : notification
      )
    )

    void markUserNotificationsRead([notificationId]).catch(() => {
      setNotifications(previousNotifications)
    })
  }

  const handleResolveInvitation = (
    notificationId: string,
    status: "accepted" | "declined"
  ) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, unread: false, status }
          : notification
      )
    )
  }

  const handleMarkAllRead = () => {
    const unreadNotificationIds = notifications
      .filter((notification) => notification.unread)
      .map((notification) => notification.id)

    if (unreadNotificationIds.length === 0) return

    const previousNotifications = notifications

    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false }))
    )

    void markUserNotificationsRead(unreadNotificationIds).catch(() => {
      setNotifications(previousNotifications)
    })
  }

  return (
    <div className="flex items-center justify-end gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title={t("header.notifications")}
            className="relative overflow-visible"
          >
            <span className="relative flex size-full items-center justify-center overflow-visible">
              <BellRing className="size-4 shrink-0" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-background" />
              )}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-88 p-0">
          <div
            className={`px-4 py-3 ${notifications.length > 0 ? "border-b" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  {t("header.notifications")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0
                    ? t("header.unreadCount", { count: unreadCount })
                    : t("header.noUnread")}
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {notifications.length}
              </Badge>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="flex-1"
              >
                <CheckCheck className="size-4" />
                {t("header.markAllAsRead")}
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link href="/feed">{t("header.viewAll")}</Link>
              </Button>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="max-h-96 space-y-2 overflow-auto p-2">
              {notifications.slice(0, 6).map((notification) => {
                const isPendingInvitation =
                  notification.type === "invitation" &&
                  notification.status === "pending"

                return (
                  <div
                    key={notification.id}
                    className="rounded-2xl border px-3 py-3 transition-colors hover:bg-accent/50"
                  >
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification.id)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <span
                        className={`mt-1 size-2 rounded-full ${
                          notification.unread ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                      <span className="min-w-0 flex-1 space-y-1">
                        <span className="block text-sm leading-5 font-medium text-foreground">
                          {notification.title}
                        </span>
                        <span className="block text-xs leading-5 text-muted-foreground">
                          {notification.description}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {notification.timeLabel}
                        </span>
                      </span>
                    </button>

                    {isPendingInvitation ? (
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            handleResolveInvitation(notification.id, "declined")
                          }
                        >
                          <XCircle className="size-4" />
                          {t("header.decline")}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            handleResolveInvitation(notification.id, "accepted")
                          }
                        >
                          <CheckCircle2 className="size-4" />
                          {t("header.accept")}
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Link href={notification.actionHref ?? "/feed"}>
                            {t("header.view")}
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleMarkRead(notification.id)}
                        >
                          <CheckCheck className="size-4" />
                          {t("header.markAsRead")}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Toggle */}
      {mounted ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={
            theme === "dark"
              ? t("header.switchToLight")
              : t("header.switchToDark")
          }
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
      ) : (
        <div className="h-10 w-10" />
      )}

      <LanguageSwitcher />

      {/* Profile Avatar Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground">
            <Avatar size="sm">
              <AvatarImage
                src={activeAvatarUrl || undefined}
                alt={displayName}
              />
              <AvatarFallback className="bg-indigo-500! text-xs font-semibold text-white!">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-72">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="size-4" />
                <span>{t("header.profile")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="size-4" />
                <span>{t("header.settings")}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="size-4" />
            <span>
              {isLoading ? t("header.loggingOut") : t("header.logout")}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
