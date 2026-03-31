import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getGroup,
  getGroupInvitations,
  getGroupMembers,
} from "@/features/groups/api/groups-service"
import { GroupDetailHeader } from "@/features/groups/components/group-detail-header"
import { GroupMembersCard } from "@/features/groups/components/group-members-card"
import { GroupOverviewCard } from "@/features/groups/components/group-overview-card"
import { InvitationsTable } from "@/features/groups/components/invitations-table"
import { UpcomingPlaySessionsSection } from "@/features/groups/components/upcoming-play-sessions-section"
import { listGroupPlaySessions } from "@/features/play-sessions/api/group-play-sessions-service"
import { getSession } from "@/lib/session"

interface GroupDetailPageProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  const { groupId } = await params
  const [group, members, session] = await Promise.all([
    getGroup(groupId),
    getGroupMembers(groupId),
    getSession(),
  ])

  const isOwner = group.role === "owner"
  const playSessions = await listGroupPlaySessions(groupId, {
    status: "SCHEDULED",
    order: "asc",
    limit: 10,
  })
  const invitations = isOwner ? await getGroupInvitations(groupId) : []

  // Filter for upcoming sessions (start time in future)
  const now = new Date()
  const upcomingSessions = playSessions.filter(
    (session) => new Date(session.startTime) > now
  )

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <GroupDetailHeader
        groupId={groupId}
        groupName={group.name}
        isOwner={isOwner}
      />
      <GroupOverviewCard group={group} />
      <GroupMembersCard members={members} />

      {/* Upcoming sessions */}
      <UpcomingPlaySessionsSection
        sessions={upcomingSessions}
        currentUserId={session.user?.id}
      />

      {/* Invitations */}
      {isOwner && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Lời mời</CardTitle>
          </CardHeader>
          <CardContent>
            <InvitationsTable
              groupId={groupId}
              initialInvitations={invitations}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
