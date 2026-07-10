import { GroupActivitySchedulePage } from "@/features/group-activity-schedule/components/group-activity-schedule-page"
import { getGroup } from "@/features/groups/api/groups-service"
import { getSession } from "@/lib/session"

interface GroupActivityScheduleRouteProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupActivityScheduleRoute({
  params,
}: GroupActivityScheduleRouteProps) {
  const { groupId } = await params
  const session = await getSession()
  let role: string | null = null
  try {
    const group = await getGroup(groupId)
    role = group.role ?? null
  } catch (err) {
    console.error("Error fetching group details in activity-schedule:", err)
  }

  return (
    <GroupActivitySchedulePage
      initialGroupId={groupId}
      currentUserRole={role}
      currentUserId={session.user?.id ?? ""}
    />
  )
}
