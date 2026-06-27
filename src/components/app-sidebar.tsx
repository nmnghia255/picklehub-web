"use client"

import { useAtomValue } from "jotai"
import {
  BellRing,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  History,
  House,
  type LucideIcon,
  MapPinned,
  Shield,
  Trophy,
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
import { useMySubscriptions } from "@/features/subscriptions/hooks/use-my-subscriptions"
import { cn } from "@/lib/utils"

type SidebarItem = {
  title: string
  href: string
  icon: LucideIcon
}

const sidebarItems: SidebarItem[] = [
  { title: "Trang chủ", href: "/home", icon: House },
  { title: "Hồ sơ", href: "/profile", icon: UserRound },
  { title: "Lịch của tôi", href: "/calendar", icon: CalendarCheck },
  { title: "Lịch sử", href: "/history", icon: History },
  { title: "Buổi chơi", href: "/socials", icon: CalendarDays },
  { title: "Giải đấu", href: "/tournaments", icon: Trophy },
  { title: "Nhóm", href: "/groups", icon: Users },
  { title: "Bạn bè", href: "/friend", icon: Users },
  { title: "Quản lý giải đấu", href: "/tournament-management", icon: Trophy },
  { title: "Thông báo", href: "/feed", icon: BellRing },
]
const socialMenuItems = [
  { title: "Danh sách buổi chơi", href: "/socials" },
  { title: "Buổi chơi của tôi", href: "/socials/me" },
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
    href: "/sport-center-management/customer",
  },
  {
    title: "Danh sách đặt sân",
    href: "/sport-center-management/booking-list",
    icon: CalendarClock,
  },
  {
    title: "Dịch vụ & Sản phẩm",
    href: "/sport-center-management/services-products",
  },
  {
    title: "Báo cáo doanh thu",
    href: "/sport-center-management/analytics",
  },
]

const SOCIAL_MENU_STORAGE_KEY = "isSocialMenuOpen"
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
  const isCollapsed = state === "collapsed"

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 transition-all duration-200",
        isCollapsed ? "justify-center py-3" : "px-3 py-4"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-lg transition-all duration-200",
          isDark && "bg-white",
          isCollapsed ? "h-8 w-8" : "h-9 w-9"
        )}
      >
        <img
          src={isDark ? "/logo-dark.png" : "/logo-light.png"}
          alt="PickleHub Logo"
          className="h-full w-full object-cover"
        />
      </div>

      {!isCollapsed && (
        <div className="text-md ml-1 font-semibold tracking-wide whitespace-nowrap text-sidebar-foreground">
          PickleHub
        </div>
      )}
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const notifications = useAtomValue(notificationFeedAtom)
  const { data: subscriptions = [] } = useMySubscriptions()
  const hasSportCenterManagerPlan = subscriptions.some(
    (sub) => sub.status === "ACTIVE" && sub.plan.type === "SPORT_CENTER_MANAGER"
  )
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false)
  const [isCoachMenuOpen, setIsCoachMenuOpen] = useState(false)
  const [isSportCenterMenuOpen, setIsSportCenterMenuOpen] = useState(false)
  const [isSportCenterManagementMenuOpen, setIsSportCenterManagementMenuOpen] =
    useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSocialMenuOpen(
      window.sessionStorage.getItem(SOCIAL_MENU_STORAGE_KEY) === "true"
    )

    setIsCoachMenuOpen(
      window.sessionStorage.getItem(COACH_MENU_STORAGE_KEY) === "true"
    )

    setIsSportCenterMenuOpen(
      window.sessionStorage.getItem(SPORT_CENTER_MENU_STORAGE_KEY) === "true"
    )

    setIsSportCenterManagementMenuOpen(
      window.sessionStorage.getItem(
        SPORT_CENTER_MANAGEMENT_MENU_STORAGE_KEY
      ) === "true"
    )
  }, [])
  const isSocialPath = isActivePath(pathname, "/socials")
  const isCoachPath = isActivePath(pathname, "/coach")
  const isSportCenterPath = isActivePath(pathname, "/sport-center")
  const isSportCenterManagementPath = isActivePath(
    pathname,
    "/sport-center-management"
  )
  const shouldShowSocialMenu = isSocialPath || isSocialMenuOpen
  const shouldShowSportCenterMenu = isSportCenterPath || isSportCenterMenuOpen
  const shouldShowCoachMenu = isCoachPath || isCoachMenuOpen
  const shouldShowSportCenterManagementMenu =
    isSportCenterManagementPath || isSportCenterManagementMenuOpen
  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length

  const handleSocialMenuToggle = () => {
    setIsSocialMenuOpen((prev) => {
      const next = !prev

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(SOCIAL_MENU_STORAGE_KEY, String(next))
      }

      return next
    })
  }

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
    if (isSocialMenuOpen) {
      setIsSocialMenuOpen(false)

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(SOCIAL_MENU_STORAGE_KEY, "false")
      }
    }

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
    <Sidebar collapsible="icon">
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

              {sidebarItems.slice(2).map((item) => {
                if (item.href === "/socials") {
                  return (
                    <SidebarMenuItem key="socials-menu">
                      <SidebarMenuButton
                        isActive={shouldShowSocialMenu}
                        tooltip="Buổi chơi"
                        onClick={handleSocialMenuToggle}
                      >
                        <CalendarDays className="size-4" />
                        <span>Buổi chơi</span>
                        <ChevronDown
                          className={cn(
                            "ml-auto size-4 transition-transform",
                            shouldShowSocialMenu && "rotate-180"
                          )}
                        />
                      </SidebarMenuButton>
                      {shouldShowSocialMenu && (
                        <SidebarMenuSub>
                          {socialMenuItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={
                                  subItem.href === "/socials"
                                    ? pathname === "/socials"
                                    : isActivePath(pathname, subItem.href)
                                }
                              >
                                <Link
                                  href={subItem.href}
                                  onClick={handlePrimaryItemClick}
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  )
                }

                return (
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
                )
              })}

              {hasSportCenterManagerPlan && (
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
              )}

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
