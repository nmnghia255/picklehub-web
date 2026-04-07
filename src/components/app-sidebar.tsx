"use client"

import {
  CalendarDays,
  ChevronDown,
  History,
  House,
  type LucideIcon,
  MapPinned,
  Newspaper,
  Shield,
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
import { cn } from "@/lib/utils"

type SidebarItem = {
  title: string
  href: string
  icon: LucideIcon
}

const sidebarItems: SidebarItem[] = [
  { title: "Home", href: "/home", icon: House },
  { title: "Sport Center", href: "/sport-center", icon: MapPinned },
  { title: "History", href: "/history", icon: History },
  { title: "Session", href: "/play-sessions", icon: CalendarDays },
  { title: "Groups", href: "/groups", icon: Users },
  { title: "Friend", href: "/friend", icon: Users },
  { title: "Feed", href: "/feed", icon: Newspaper },
]

const coachMenuItems = [
  { title: "Coach Dashboard", href: "/coach" },
  { title: "Professional Profile", href: "/coach/profile" },
  { title: "Student List", href: "/coach/students" },
  { title: "Training Schedule", href: "/coach/schedule" },
  { title: "Curriculum Management", href: "/coach/curriculum" },
  { title: "Video Analysis", href: "/coach/video-analysis" },
  { title: "Learning Roadmap", href: "/coach/roadmap" },
  { title: "Income Statistics", href: "/coach/income" },
]

const COACH_MENU_STORAGE_KEY = "isCoachMenuOpen"

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
  const [isCoachMenuOpen, setIsCoachMenuOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.sessionStorage.getItem(COACH_MENU_STORAGE_KEY) === "true"
  })
  const isCoachPath = isActivePath(pathname, "/coach")
  const shouldShowCoachMenu = isCoachPath || isCoachMenuOpen

  const handleCoachMenuToggle = () => {
    setIsCoachMenuOpen((prev) => {
      const next = !prev

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(COACH_MENU_STORAGE_KEY, String(next))
      }

      return next
    })
  }

  const handlePrimaryItemClick = () => {
    if (isCoachMenuOpen) {
      setIsCoachMenuOpen(false)

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(COACH_MENU_STORAGE_KEY, "false")
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
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActivePath(pathname, item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href} onClick={handlePrimaryItemClick}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={shouldShowCoachMenu}
                  tooltip="Coach"
                  onClick={handleCoachMenuToggle}
                >
                  <Shield className="size-4" />
                  <span>Coach</span>
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
