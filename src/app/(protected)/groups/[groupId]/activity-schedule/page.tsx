import { GroupActivitySchedulePage } from "@/features/group-activity-schedule"
import { getGroup } from "@/features/groups/api/groups-service"
import { GroupDetailDataProvider } from "@/features/groups/components/details/group-detail-data-provider"
import type { Group } from "@/features/groups/types"
import { getSession } from "@/lib/session"

interface GroupActivityScheduleRouteProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupActivityScheduleRoute({
  params,
}: GroupActivityScheduleRouteProps) {
  const { groupId } = await params
  const session = await getSession()
  let group: Group | null = null
  let role: string | null = null
  try {
    group = await getGroup(groupId)
    role = group.role ?? null
  } catch (err) {
    console.error("Error fetching group details in activity-schedule:", err)
  }

  const content = (
    <GroupActivitySchedulePage
      initialGroupId={groupId}
      currentUserRole={role}
      currentUserId={session.user?.id ?? ""}
    />
  )

  return group ? (
    <GroupDetailDataProvider groupId={groupId} group={group}>
      {content}
    </GroupDetailDataProvider>
  ) : (
    content
  )
}
