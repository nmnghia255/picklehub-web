"use client"

import { useAtomValue } from "jotai"
import {
  Award,
  BellRing,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  Handshake,
  House,
  type LucideIcon,
  MapPinned,
  MessageSquare,
  Shield,
  Trophy,
  UserRound,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

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
  useSidebar,
} from "@/components/ui/sidebar"
import { notificationFeedAtom } from "@/features/feed/store/feed-store"
import { useMySubscriptions } from "@/features/subscriptions/hooks/use-my-subscriptions"
import { cn } from "@/lib/utils"

type SidebarItem = {
  titleKey: string
  href: string
  icon: LucideIcon
}

const sidebarItems: SidebarItem[] = [
  { titleKey: "home", href: "/home", icon: House },
  { titleKey: "profile", href: "/profile", icon: UserRound },
  { titleKey: "courts", href: "/sport-center", icon: Building2 },
  { titleKey: "myCalendar", href: "/calendar", icon: CalendarCheck },
  { titleKey: "discoverSocial", href: "/socials", icon: CalendarDays },
  { titleKey: "mySocial", href: "/socials/me", icon: CalendarClock },
  { titleKey: "tournaments", href: "/tournaments", icon: Trophy },
  { titleKey: "groups", href: "/groups", icon: Users },
  { titleKey: "friends", href: "/friend", icon: Handshake },
  { titleKey: "chat", href: "/chat", icon: MessageSquare },
  {
    titleKey: "tournamentManagement",
    href: "/tournament-management",
    icon: Award,
  },
  { titleKey: "notifications", href: "/feed", icon: BellRing },
  { titleKey: "learner", href: "/learner", icon: BookOpen },
  { titleKey: "coach", href: "/coach", icon: Shield },
]

const sportCenterManagementMenuItems = [
  {
    titleKey: "manageCenters",
    href: "/sport-center-management",
  },
  {
    titleKey: "courtManagement",
    href: "/sport-center-management/courts-management",
  },
  {
    titleKey: "customerManagement",
    href: "/sport-center-management/customer",
  },
  {
    titleKey: "bookingList",
    href: "/sport-center-management/booking-list",
    icon: CalendarClock,
  },
  {
    titleKey: "servicesProducts",
    href: "/sport-center-management/services-products",
  },
  {
    titleKey: "revenueReport",
    href: "/sport-center-management/analytics",
  },
]

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
  const { t } = useTranslation("common")
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
          alt={t("logoAlt")}
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
  const { t } = useTranslation("common")
  const notifications = useAtomValue(notificationFeedAtom)
  const { data: subscriptions = [] } = useMySubscriptions()
  const hasSportCenterManagerPlan = subscriptions.some(
    (sub) => sub.status === "ACTIVE" && sub.plan.type === "SPORT_CENTER_MANAGER"
  )
  const hasTournamentOrganizerPlan = subscriptions.some(
    (sub) => sub.status === "ACTIVE" && sub.plan.type === "TOURNAMENT_ORGANIZER"
  )
  const hasCoachPlan = subscriptions.some(
    (sub) => sub.status === "ACTIVE" && sub.plan.type === "COACH"
  )
  const [isSportCenterManagementMenuOpen, setIsSportCenterManagementMenuOpen] =
    useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSportCenterManagementMenuOpen(
      window.sessionStorage.getItem(
        SPORT_CENTER_MANAGEMENT_MENU_STORAGE_KEY
      ) === "true"
    )
  }, [])
  const isSportCenterManagementPath = isActivePath(
    pathname,
    "/sport-center-management"
  )
  const shouldShowSportCenterManagementMenu =
    isSportCenterManagementPath || isSportCenterManagementMenuOpen
  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length

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
              {sidebarItems
                .filter((item) => {
                  if (item.href === "/tournament-management") {
                    return hasTournamentOrganizerPlan
                  }
                  if (item.href === "/coach") {
                    return hasCoachPlan
                  }
                  return true
                })
                .map((item) => {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActivePath(pathname, item.href)}
                        tooltip={t(`sidebar.${item.titleKey}`)}
                        className="h-10 rounded-xl px-3 text-slate-700 transition-all duration-200 hover:bg-slate-100 data-[active=true]:!bg-emerald-600 data-[active=true]:!text-white data-[active=true]:shadow-xs data-[active=true]:hover:!bg-emerald-700 data-[active=true]:hover:!text-white dark:text-zinc-300 dark:hover:bg-zinc-900 [&>span:last-child]:truncate [&>svg]:size-[18px] [&>svg]:shrink-0"
                      >
                        <Link
                          href={item.href}
                          onClick={handlePrimaryItemClick}
                          className="flex w-full items-center"
                        >
                          <span className="relative inline-flex shrink-0 items-center justify-center">
                            <item.icon className="size-[18px]" />
                            {item.href === "/feed" && unreadCount > 0 && (
                              <span className="ring-sidebar-background absolute -top-1 -right-1 size-2 rounded-full bg-red-500 ring-2" />
                            )}
                          </span>
                          <span className="ml-3 flex-1 truncate">
                            {t(`sidebar.${item.titleKey}`)}
                          </span>
                          {item.href === "/feed" && unreadCount > 0 && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1 text-[10px] font-medium text-slate-600 group-data-[collapsible=icon]:hidden dark:bg-zinc-800 dark:text-zinc-400">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}

              {hasSportCenterManagerPlan && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={shouldShowSportCenterManagementMenu}
                    tooltip={t("sidebar.centerManagement")}
                    onClick={handleSportCenterManagementMenuToggle}
                    className="h-10 rounded-xl px-3 text-slate-700 transition-all duration-200 hover:bg-slate-100 data-[active=true]:!bg-emerald-600 data-[active=true]:!text-white data-[active=true]:shadow-xs data-[active=true]:hover:!bg-emerald-700 data-[active=true]:hover:!text-white dark:text-zinc-300 dark:hover:bg-zinc-900 [&>svg]:size-[18px]"
                  >
                    <MapPinned className="size-[18px]" />
                    <span>{t("sidebar.centerManagement")}</span>
                    <ChevronDown
                      className={cn(
                        "ml-auto size-4 transition-transform",
                        shouldShowSportCenterManagementMenu && "rotate-180"
                      )}
                    />
                  </SidebarMenuButton>
                  {shouldShowSportCenterManagementMenu && (
                    <SidebarMenuSub className="ml-4 border-l border-slate-200 pl-2 dark:border-zinc-800">
                      {sportCenterManagementMenuItems.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActivePath(pathname, item.href)}
                            className="h-8 rounded-lg px-3 text-slate-600 transition-all duration-200 hover:bg-slate-100 data-[active=true]:!bg-emerald-50 data-[active=true]:font-medium data-[active=true]:!text-emerald-600 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:data-[active=true]:!bg-emerald-950/40 dark:data-[active=true]:!text-emerald-400"
                          >
                            <Link
                              href={item.href}
                              onClick={handlePrimaryItemClick}
                            >
                              <span>{t(`sidebar.${item.titleKey}`)}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
