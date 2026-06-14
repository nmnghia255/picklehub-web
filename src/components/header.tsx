"use client"

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

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notificationFeedAtom } from "@/features/feed/store/feed-store"
import { useMySubscriptions } from "@/features/subscriptions/hooks/use-my-subscriptions"
import type { SessionUser } from "@/lib/session"

export interface HeaderProps {
  user: SessionUser
}

export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useAtom(notificationFeedAtom)

  // Call the hook to trigger fetching & caching subscriptions on app mount for authenticated user
  const { data: subscriptions } = useMySubscriptions()

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
        router.push("/login")
      }
    } catch (error) {
      console.error("Đăng xuất thất bại:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const displayName = user.email?.split("@")[0] || "Người dùng"
  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length

  const handleMarkRead = (notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, unread: false }
          : notification
      )
    )
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
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false }))
    )
  }

  return (
    <div className="flex items-center justify-end gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title="Thông báo"
            className="relative"
          >
            <BellRing className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-background" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-88 p-0">
          <div className="border-b px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Thông báo</p>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0
                    ? `Có ${unreadCount} thông báo chưa đọc`
                    : "Không có thông báo chưa đọc"}
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
                Đã đọc hết
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link href="/feed">Xem tất cả</Link>
              </Button>
            </div>
          </div>

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
                        Từ chối
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          handleResolveInvitation(notification.id, "accepted")
                        }
                      >
                        <CheckCircle2 className="size-4" />
                        Chấp nhận
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
                          Xem
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleMarkRead(notification.id)}
                      >
                        <CheckCheck className="size-4" />
                        Đã đọc
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
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
              ? "Chuyển sang chế độ sáng"
              : "Chuyển sang chế độ tối"
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

      {/* Profile Avatar Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground">
            <Avatar size="sm">
              <AvatarFallback className="text-xs font-semibold">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-72">
          <DropdownMenuLabel className="flex flex-col space-y-1">
            <span className="text-sm font-medium break-all">{user.email}</span>
            {(() => {
              const activeSubscriptions = subscriptions?.filter(
                (sub) => sub.status === "ACTIVE"
              )
              if (activeSubscriptions && activeSubscriptions.length > 0) {
                return (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {activeSubscriptions.map((sub) => (
                      <Badge
                        key={sub.id}
                        variant="secondary"
                        className="w-fit border-none bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase hover:bg-primary/20"
                      >
                        {sub.plan.name}
                      </Badge>
                    ))}
                  </div>
                )
              }
              return null
            })()}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="size-4" />
                <span>Hồ sơ</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="size-4" />
                <span>Cài đặt</span>
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
            <span>{isLoading ? "Đang đăng xuất..." : "Đăng xuất"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
