"use client"

import {
  CalendarDays,
  History,
  House,
  type LucideIcon,
  MapPinned,
  Newspaper,
  UserRound,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type SidebarItem = {
  title: string
  href: string
  icon: LucideIcon
}

const sidebarItems: SidebarItem[] = [
  { title: "Home", href: "/home", icon: House },
  { title: "Profile", href: "/settings/profile", icon: UserRound },
  { title: "Sport Center", href: "/sport-center", icon: MapPinned },
  { title: "History", href: "/history", icon: History },
  { title: "Session", href: "/play-sessions", icon: CalendarDays },
  { title: "Groups", href: "/groups", icon: Users },
  { title: "Friend", href: "/friend", icon: Users },
  { title: "Feed", href: "/feed", icon: Newspaper },
]

function isActivePath(pathname: string, href: string) {
  if (pathname === href) {
    return true
  }

  return pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="text-sm font-semibold tracking-wide text-sidebar-foreground">
          PickleHub
        </div>
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
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
