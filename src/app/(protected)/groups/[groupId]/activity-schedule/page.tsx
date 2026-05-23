import { GroupActivitySchedulePage } from "@/features/group-activity-schedule/components/group-activity-schedule-page"

interface GroupActivityScheduleRouteProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupActivityScheduleRoute({
  params,
}: GroupActivityScheduleRouteProps) {
  const { groupId } = await params

  return <GroupActivitySchedulePage initialGroupId={groupId} />
}
