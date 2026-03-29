import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getSession } from "@/lib/session"

export default async function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session.user) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/90 px-4 backdrop-blur">
          <SidebarTrigger />
        </header>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
