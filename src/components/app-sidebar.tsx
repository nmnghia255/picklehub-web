"use client"

import { useAtomValue } from "jotai"
import {
  BellRing,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  History,
  House,
  type LucideIcon,
  MapPinned,
  Shield,
  UserRound,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import { notificationFeedAtom } from "@/features/feed/store/feed-store"
import { cn } from "@/lib/utils"

type SidebarItem = {
  title: string
  href: string
  icon: LucideIcon
}

const sidebarItems: SidebarItem[] = [
  { title: "Trang chủ", href: "/home", icon: House },
  { title: "Hồ sơ", href: "/profile", icon: UserRound },
  { title: "Lịch sử", href: "/history", icon: History },
  { title: "Buổi chơi", href: "/socials", icon: CalendarDays },
  { title: "Nhóm", href: "/groups", icon: Users },
  { title: "Bạn bè", href: "/friend", icon: Users },
  { title: "Thông báo", href: "/feed", icon: BellRing },
]
const sportCenterMenuItems = [
  { title: "Danh sách sân", href: "/sport-center" },
  { title: "Lịch sử đặt sân", href: "/sport-center/booking-history" },
]

const coachMenuItems = [
  { title: "Tổng quan huấn luyện viên", href: "/coach" },
  { title: "Hồ sơ chuyên nghiệp", href: "/coach/profile" },
  { title: "Danh sách học viên", href: "/coach/students" },
  { title: "Lịch tập", href: "/coach/schedule" },
  { title: "Quản lý giáo trình", href: "/coach/curriculum" },
  { title: "Phân tích video", href: "/coach/video-analysis" },
  { title: "Lộ trình học tập", href: "/coach/roadmap" },
  { title: "Thống kê thu nhập", href: "/coach/income" },
]

const sportCenterManagementMenuItems = [
  {
    title: "Quản lý sân",
    href: "/sport-center-management/courts-management",
  },
  {
    title: "Quản lý khách hàng",
    href: "/sport-center-management/customer-management",
  },
  {
    title: "Danh sách đặt sân",
    href: "/sport-center-management/booking-list",
    icon: CalendarClock,
  },
  {
    title: "Báo cáo doanh thu",
    href: "/sport-center-management/analytics",
  },
]

const COACH_MENU_STORAGE_KEY = "isCoachMenuOpen"
const SPORT_CENTER_MENU_STORAGE_KEY = "isSportCenterMenuOpen"
const SPORT_CENTER_MANAGEMENT_MENU_STORAGE_KEY =
  "isSportCenterManagementMenuOpen"

function isActivePath(pathname: string, href: string) {
  if (pathname === href) {
    return true
  }

  return pathname.startsWith(`${href}/`)
}

function SidebarLogo() {
  const { state } = useSidebar()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <div className="flex items-center gap-2 px-3 py-4">
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded p-1.5 transition-colors",
          isDark && "bg-white"
        )}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isDark ? "text-gray-900" : "text-sidebar-foreground"}
        >
          <polygon points="20,4 36,32 4,32" fill="currentColor" />
        </svg>
      </div>

      {state !== "collapsed" && (
        <div className="text-sm font-semibold tracking-wide whitespace-nowrap text-sidebar-foreground">
          PickleHub
        </div>
      )}
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const notifications = useAtomValue(notificationFeedAtom)
  const [isCoachMenuOpen, setIsCoachMenuOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.sessionStorage.getItem(COACH_MENU_STORAGE_KEY) === "true"
  })
  const [isSportCenterMenuOpen, setIsSportCenterMenuOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return (
      window.sessionStorage.getItem(SPORT_CENTER_MENU_STORAGE_KEY) === "true"
    )
  })
  const [isSportCenterManagementMenuOpen, setIsSportCenterManagementMenuOpen] =
    useState(() => {
      if (typeof window === "undefined") {
        return false
      }

      return (
        window.sessionStorage.getItem(
          SPORT_CENTER_MANAGEMENT_MENU_STORAGE_KEY
        ) === "true"
      )
    })
  const isCoachPath = isActivePath(pathname, "/coach")
  const isSportCenterPath = isActivePath(pathname, "/sport-center")
  const isSportCenterManagementPath = isActivePath(
    pathname,
    "/sport-center-management"
  )
  const shouldShowSportCenterMenu = isSportCenterPath || isSportCenterMenuOpen
  const shouldShowCoachMenu = isCoachPath || isCoachMenuOpen
  const shouldShowSportCenterManagementMenu =
    isSportCenterManagementPath || isSportCenterManagementMenuOpen
  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length

  const handleCoachMenuToggle = () => {
    setIsCoachMenuOpen((prev) => {
      const next = !prev

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(COACH_MENU_STORAGE_KEY, String(next))
      }

      return next
    })
  }

  const handleSportCenterMenuToggle = () => {
    setIsSportCenterMenuOpen((prev) => {
      const next = !prev

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          SPORT_CENTER_MENU_STORAGE_KEY,
          String(next)
        )
      }

      return next
    })
  }

  const handleSportCenterManagementMenuToggle = () => {
    setIsSportCenterManagementMenuOpen((prev) => {
      const next = !prev

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          SPORT_CENTER_MANAGEMENT_MENU_STORAGE_KEY,
          String(next)
        )
      }

      return next
    })
  }

  const handlePrimaryItemClick = () => {
    if (isSportCenterMenuOpen) {
      setIsSportCenterMenuOpen(false)

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(SPORT_CENTER_MENU_STORAGE_KEY, "false")
      }
    }

    if (isCoachMenuOpen) {
      setIsCoachMenuOpen(false)

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(COACH_MENU_STORAGE_KEY, "false")
      }
    }

    if (isSportCenterManagementMenuOpen) {
      setIsSportCenterManagementMenuOpen(false)

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          SPORT_CENTER_MANAGEMENT_MENU_STORAGE_KEY,
          "false"
        )
      }
    }
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.slice(0, 2).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActivePath(pathname, item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href} onClick={handlePrimaryItemClick}>
                      <span className="relative inline-flex items-center justify-center">
                        <item.icon className="size-4" />
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={shouldShowSportCenterMenu}
                  tooltip="Sân"
                  onClick={handleSportCenterMenuToggle}
                >
                  <Building2 className="size-4" />
                  <span>Sân</span>
                  <ChevronDown
                    className={cn(
                      "ml-auto size-4 transition-transform",
                      shouldShowSportCenterMenu && "rotate-180"
                    )}
                  />
                </SidebarMenuButton>
                {shouldShowSportCenterMenu && (
                  <SidebarMenuSub>
                    {sportCenterMenuItems.map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActivePath(pathname, item.href)}
                        >
                          <Link
                            href={item.href}
                            onClick={handlePrimaryItemClick}
                          >
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {sidebarItems.slice(2).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActivePath(pathname, item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href} onClick={handlePrimaryItemClick}>
                      <span className="relative inline-flex items-center justify-center">
                        <item.icon className="size-4" />
                        {item.href === "/feed" && unreadCount > 0 && (
                          <span className="ring-sidebar-background absolute -top-1 -right-1 size-2 rounded-full bg-red-500 ring-2" />
                        )}
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={shouldShowSportCenterManagementMenu}
                  tooltip="Quản lý trung tâm"
                  onClick={handleSportCenterManagementMenuToggle}
                >
                  <MapPinned className="size-4" />
                  <span>Quản lý trung tâm</span>
                  <ChevronDown
                    className={cn(
                      "ml-auto size-4 transition-transform",
                      shouldShowSportCenterManagementMenu && "rotate-180"
                    )}
                  />
                </SidebarMenuButton>
                {shouldShowSportCenterManagementMenu && (
                  <SidebarMenuSub>
                    {sportCenterManagementMenuItems.map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActivePath(pathname, item.href)}
                        >
                          <Link
                            href={item.href}
                            onClick={handlePrimaryItemClick}
                          >
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={shouldShowCoachMenu}
                  tooltip="Huấn luyện viên"
                  onClick={handleCoachMenuToggle}
                >
                  <Shield className="size-4" />
                  <span>Huấn luyện viên</span>
                  <ChevronDown
                    className={cn(
                      "ml-auto size-4 transition-transform",
                      shouldShowCoachMenu && "rotate-180"
                    )}
                  />
                </SidebarMenuButton>
                {shouldShowCoachMenu && (
                  <SidebarMenuSub>
                    {coachMenuItems.map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActivePath(pathname, item.href)}
                        >
                          <Link href={item.href}>
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
