import { ErrorSection } from "@/components/error-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getGroup,
  getGroupInvitations,
} from "@/features/groups/api/groups-service"
import { GroupDetailHeader } from "@/features/groups/components/group-detail-header"
import { GroupMembersCard } from "@/features/groups/components/group-members-card"
import { GroupOverviewCard } from "@/features/groups/components/group-overview-card"
import { InvitationsTable } from "@/features/groups/components/invitations-table"
import { UpcomingPlaySessionsSection } from "@/features/groups/components/upcoming-play-sessions-section"

interface GroupDetailPageProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  const { groupId } = await params

  let group
  let invitations = []
  let isOwner = false

  try {
    group = await getGroup(groupId)

    isOwner = group.role === "owner"
    invitations = isOwner ? await getGroupInvitations(groupId) : []
  } catch (error) {
    console.error("Error loading group details:", error)
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <ErrorSection
          className="mb-4"
          message="Đã xảy ra lỗi khi tải thông tin nhóm. Vui lòng thử lại sau."
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <GroupDetailHeader
        groupId={groupId}
        groupName={group.name}
        isOwner={isOwner}
      />
      <GroupOverviewCard groupId={groupId} />
      <GroupMembersCard groupId={groupId} />

      {/* Upcoming sessions */}
      <UpcomingPlaySessionsSection groupId={groupId} />

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
