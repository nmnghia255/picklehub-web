import { Suspense } from "react"

import { DashboardGroups } from "@/components/dashboard-groups"
import { DashboardPendingInvites } from "@/components/dashboard-pending-invites"
import { DashboardQuickActions } from "@/components/dashboard-quick-actions"
import { DashboardStats } from "@/components/dashboard-stats"
import { getMyGroups } from "@/features/groups/api/groups-service"
import { getSession } from "@/lib/session"

function mapGroup(g: Awaited<ReturnType<typeof getMyGroups>>[number]) {
  return {
    id: g.id,
    name: g.name,
    description: g.description ?? undefined,
    memberCount: g.memberCount,
    role: g.role as "OWNER" | "MEMBER",
  }
}

export default async function HomePage() {
  const session = await getSession()
  const userName = session?.user?.email?.split("@")[0] || "Bạn"

  const groups = (await getMyGroups().catch(() => [])).map(mapGroup)
  const groupsCount = groups.length
  const membersCount = groups.reduce((acc, g) => acc + g.memberCount, 0)
  const pendingInvitesCount = 0

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex flex-col gap-8 px-6 py-8 md:px-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Xin chào, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Đây là trang chủ của bạn, nơi bạn có thể quản lý nhóm và bạn bè.
          </p>
        </div>

        {/* Stats Section */}
        <Suspense
          fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}
        >
          <DashboardStats
            groupsCount={groupsCount}
            membersCount={membersCount}
            pendingInvitesCount={pendingInvitesCount}
          />
        </Suspense>

        {/* Quick Actions */}
        <Suspense
          fallback={<div className="h-32 animate-pulse rounded-lg bg-muted" />}
        >
          <DashboardQuickActions />
        </Suspense>

        {/* Pending Invites */}
        {pendingInvitesCount > 0 && (
          <Suspense
            fallback={
              <div className="h-32 animate-pulse rounded-lg bg-muted" />
            }
          >
            <DashboardPendingInvites invites={[]} />
          </Suspense>
        )}

        {/* Groups Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold">Nhóm của tôi</h2>
            <p className="text-muted-foreground">
              Những nhóm khác nhau mà bạn quản lý hoặc tham gia
            </p>
          </div>
          <Suspense
            fallback={
              <div className="h-40 animate-pulse rounded-lg bg-muted" />
            }
          >
            <DashboardGroups groups={groups} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
