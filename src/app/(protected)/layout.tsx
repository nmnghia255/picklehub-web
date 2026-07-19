import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ChatBot } from "@/features/ai/components/chat-bot"
import { getMyProfile } from "@/features/profile/api/profile-service"
import type { SessionUser } from "@/lib/session"
import { getSession } from "@/lib/session"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  // Enrich session user with fresh profile data (avatarUrl, name, etc.)
  // so the Header always displays the correct avatar.
  let headerUser: SessionUser = session.user
  try {
    const profile = await getMyProfile()
    headerUser = {
      id: profile.id,
      email: profile.email ?? session.user.email,
      name: profile.fullName ?? profile.name ?? session.user.name,
      phoneNumber: profile.phoneNumber ?? session.user.phoneNumber,
      avatarUrl: profile.avatarUrl ?? session.user.avatarUrl,
    }
  } catch (err) {
    if (err instanceof Error && err.message === "Session expired") {
      redirect("/api/auth/logout")
    }
    // Profile fetch failed — fall back to session data
  }

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur">
          <SidebarTrigger />
          <Header user={headerUser} />
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
      <ChatBot />
    </SidebarProvider>
  )
}
