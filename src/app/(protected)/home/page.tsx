import { DashboardHomeContent } from "@/components/dashboard-home"
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
  const userName = session?.user?.email?.split("@")[0] ?? null

  const groups = (await getMyGroups().catch(() => [])).map(mapGroup)
  const groupsCount = groups.length
  const membersCount = groups.reduce((acc, g) => acc + g.memberCount, 0)
  const pendingInvitesCount = 0

  return (
    <DashboardHomeContent
      userName={userName}
      groups={groups}
      groupsCount={groupsCount}
      membersCount={membersCount}
      pendingInvitesCount={pendingInvitesCount}
    />
  )
}
