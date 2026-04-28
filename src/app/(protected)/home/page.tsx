import { Suspense } from "react"

import { DashboardGroups } from "@/components/dashboard-groups"
import { DashboardPendingInvites } from "@/components/dashboard-pending-invites"
import { DashboardQuickActions } from "@/components/dashboard-quick-actions"
import { DashboardStats } from "@/components/dashboard-stats"
import { getSession } from "@/lib/session"

// Mock data - In production, this should come from API
const mockGroups = [
  {
    id: "1",
    name: "Nhóm Pickleball Hà Nội",
    description: "Nhóm chơi pickleball tại Hà Nội",
    memberCount: 12,
    role: "OWNER" as const,
  },
  {
    id: "2",
    name: "Nhóm Bạn Đại Học",
    description: "Nhóm bạn bè từ thời đại học",
    memberCount: 8,
    role: "MEMBER" as const,
  },
  {
    id: "3",
    name: "Nhóm Du Lịch",
    memberCount: 5,
    role: "ADMIN" as const,
  },
]

const mockPendingInvites = [
  {
    id: "1",
    groupName: "Nhóm Pickleball TP HCM",
    invitedBy: "Nguyễn Văn A",
    createdAt: "2024-03-25",
  },
]

export default async function HomePage() {
  const session = await getSession()
  const userName = session?.user?.email?.split("@")[0] || "Bạn"

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
            groupsCount={mockGroups.length}
            membersCount={mockGroups.reduce((acc, g) => acc + g.memberCount, 0)}
            pendingInvitesCount={mockPendingInvites.length}
          />
        </Suspense>

        {/* Quick Actions */}
        <Suspense
          fallback={<div className="h-32 animate-pulse rounded-lg bg-muted" />}
        >
          <DashboardQuickActions />
        </Suspense>

        {/* Pending Invites */}
        {mockPendingInvites.length > 0 && (
          <Suspense
            fallback={
              <div className="h-32 animate-pulse rounded-lg bg-muted" />
            }
          >
            <DashboardPendingInvites invites={mockPendingInvites} />
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
            <DashboardGroups groups={mockGroups} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
