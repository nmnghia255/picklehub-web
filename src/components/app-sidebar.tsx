"use client"

import {
  CalendarDays,
  Feather,
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
  { title: "Trang chủ", href: "/home", icon: House },
  { title: "Hồ sơ", href: "/settings/profile", icon: UserRound },
  { title: "Sân", href: "/sport-center", icon: MapPinned },
  { title: "Lịch sử", href: "/history", icon: History },
  { title: "Nhóm", href: "/groups", icon: Users },
  { title: "Buổi chơi", href: "/play-sessions", icon: CalendarDays },
  { title: "Bạn bè", href: "/friend", icon: Users },
  { title: "Bảng tin", href: "/feed", icon: Newspaper },
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
      <SidebarHeader className="flex flex-row items-center justify-start gap-2 px-3 py-4 text-left">
        {/* Logo */}
        <Feather className="size-5 shrink-0 text-primary" />
        {/* Brand Name */}
        <span className="text-sm font-semibold tracking-wide whitespace-nowrap text-sidebar-foreground group-data-[state=collapsed]:hidden">
          PickleHub
        </span>
      </SidebarHeader>

      {/* Sidebar Content */}
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
