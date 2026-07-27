"use client"

import { useQuery } from "@tanstack/react-query"
import { useAtomValue } from "jotai"
import {
  Activity,
  Award,
  BellRing,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
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
import { usePathname, useSearchParams } from "next/navigation"
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
  {
    titleKey: "centerManagement",
    href: "/sport-center-management",
    icon: MapPinned,
  },
]

function isActivePath(
  pathname: string,
  href: string,
  allHrefs: string[],
  searchParams?: URLSearchParams | null
) {
  const fromMe = searchParams?.get("from") === "me"

  if (pathname.startsWith("/socials/") && pathname !== "/socials/me") {
    if (fromMe) {
      if (href === "/socials/me") return true
      if (href === "/socials") return false
    }
  }

  if (pathname !== href && !pathname.startsWith(`${href}/`)) {
    return false
  }

  return !allHrefs.some(
    (otherHref) =>
      otherHref !== href &&
      otherHref.length > href.length &&
      (pathname === otherHref || pathname.startsWith(`${otherHref}/`))
  )
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
    <Link
      href="/home"
      className={cn(
        "flex cursor-pointer items-center gap-2.5 transition-all duration-200",
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
    </Link>
  )
}

const adminSidebarItems = [
  {
    titleKey: "aiMonitoring",
    label: "AI Monitoring",
    href: "/admin/ai/monitoring",
    icon: Activity,
  },
  {
    titleKey: "aiKnowledge",
    label: "AI Knowledge",
    href: "/admin/ai/knowledge",
    icon: BookOpen,
  },
  {
    titleKey: "userManagement",
    label: "Users Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    titleKey: "coachCertifications",
    label: "Coach Certifications",
    href: "/admin/coaches/certifications",
    icon: Award,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useTranslation("common")
  const notifications = useAtomValue(notificationFeedAtom)
  const { data: subscriptions = [] } = useMySubscriptions()

  const { data: userProfile } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      try {
        const authRes = await fetch("/api/proxy/auth/me")
        if (authRes.ok) {
          const authData = await authRes.json()
          const profile = authData?.data ?? authData
          if (profile?.role) return profile
        }
      } catch {
        // Fallback to /api/users/me if auth/me fails
      }
      const res = await fetch("/api/users/me")
      if (!res.ok) return null
      const data = await res.json()
      return data?.data ?? data
    },
    staleTime: 5 * 60 * 1000,
  })

  const hasSportCenterManagerPlan = subscriptions.some(
    (sub) => sub.status === "ACTIVE" && sub.plan.type === "SPORT_CENTER_MANAGER"
  )
  const hasTournamentOrganizerPlan = subscriptions.some(
    (sub) => sub.status === "ACTIVE" && sub.plan.type === "TOURNAMENT_ORGANIZER"
  )
  const hasCoachPlan = subscriptions.some(
    (sub) => sub.status === "ACTIVE" && sub.plan.type === "COACH"
  )
  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length

  const isAdminRoute = pathname.startsWith("/admin")
  const isAdminRole = userProfile?.role === "ADMIN"
  const isAdminUser = isAdminRoute || isAdminRole

  const itemsToRender = isAdminRoute
    ? adminSidebarItems
    : [
        ...sidebarItems,
        ...(isAdminRole
          ? [
              {
                titleKey: "aiMonitoring",
                label: "AI Monitoring",
                href: "/admin/ai/monitoring",
                icon: Activity,
              },
              {
                titleKey: "userManagement",
                label: "Users Management",
                href: "/admin/users",
                icon: Users,
              },
            ]
          : []),
      ]

  const allHrefs = itemsToRender.map((item) => item.href)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsToRender
                .filter((item) => {
                  if (isAdminUser) return true
                  if (item.href === "/tournament-management") {
                    return hasTournamentOrganizerPlan
                  }
                  if (item.href === "/coach") {
                    return hasCoachPlan
                  }
                  if (item.href === "/sport-center-management") {
                    return hasSportCenterManagerPlan
                  }
                  return true
                })
                .map((item) => {
                  const label =
                    "label" in item && item.label
                      ? item.label
                      : t(`sidebar.${item.titleKey}`, item.titleKey)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActivePath(
                          pathname,
                          item.href,
                          allHrefs,
                          searchParams
                        )}
                        tooltip={label}
                        className="h-10 rounded-xl px-3 text-slate-700 transition-all duration-200 group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:p-0! hover:bg-slate-100 data-[active=true]:bg-emerald-600! data-[active=true]:text-white! data-[active=true]:shadow-xs data-[active=true]:hover:bg-emerald-700! data-[active=true]:hover:text-white! dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        <Link
                          href={item.href}
                          className="flex w-full items-center gap-3 group-data-[collapsible=icon]:justify-center"
                        >
                          <span className="relative inline-flex shrink-0 items-center justify-center overflow-visible">
                            <item.icon className="size-4.5" />
                            {item.href === "/feed" && unreadCount > 0 && (
                              <span className="ring-sidebar-background absolute -top-0.5 -right-0.5 z-20 size-2 rounded-full bg-red-500 ring-2 group-data-[active=true]:ring-emerald-600" />
                            )}
                          </span>
                          <span className="flex-1 truncate group-data-[collapsible=icon]:hidden">
                            {label}
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
