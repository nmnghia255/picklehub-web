import { DeleteStatusToast } from "@/components/delete-status-toast"
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
import { listPlaySessions } from "@/features/play-sessions/api/public-play-sessions-service"
import type {
  GroupPlaySession,
  ListPlaySessionsParams,
} from "@/features/play-sessions/types"
import { getSession } from "@/lib/session"

function getHttpStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null
  }

  const maybeError = error as { response?: { status?: unknown } }
  const status = maybeError.response?.status
  return typeof status === "number" ? status : null
}

interface GroupDetailPageProps {
  params: Promise<{ groupId: string }>
  searchParams: Promise<{ delete?: string }>
}

export default async function GroupDetailPage({
  params,
  searchParams,
}: GroupDetailPageProps) {
  const { groupId } = await params
  const { delete: deleteStatus } = await searchParams
  const session = await getSession()

  let group
  let invitations = []
  let isOwner = false
  let upcomingSessions: GroupPlaySession[] = []
  let hasUpcomingSessionsError = false

  try {
    group = await getGroup(groupId)

    isOwner = group.role === "owner"
    invitations = isOwner ? await getGroupInvitations(groupId) : []
  } catch (error) {
    const status = getHttpStatus(error)

    if (status !== 403 && status !== 404) {
      console.error("Error loading group details:", error)
    }

    const message =
      status === 403
        ? "Bạn không có quyền truy cập nhóm này."
        : status === 404
          ? "Không tìm thấy nhóm hoặc nhóm đã bị xóa."
          : "Đã xảy ra lỗi khi tải thông tin nhóm. Vui lòng thử lại sau."

    return (
      <div className="container mx-auto max-w-4xl p-6">
        <ErrorSection className="mb-4" message={message} />
      </div>
    )
  }

  try {
    const params: ListPlaySessionsParams = {
      contextType: "INTERNAL_GROUP",
      groupId,
      status: "PUBLISHED",
      sortBy: "startTime",
      order: "asc",
    }
    const sessionsResponse = await listPlaySessions(params)
    const sessionsPayload = sessionsResponse?.data || []
    upcomingSessions = sessionsPayload
  } catch (error) {
    console.error("Error loading upcoming sessions:", error)
    hasUpcomingSessionsError = true
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <DeleteStatusToast
        status={deleteStatus}
        successMessage="Xoa buoi choi thanh cong."
      />
      <GroupDetailHeader
        groupId={groupId}
        groupName={group.name}
        isOwner={isOwner}
      />
      <GroupOverviewCard group={group} />
      <GroupMembersCard
        groupId={groupId}
        currentUserId={session.user?.id ?? ""}
        currentUserRole={group.role ?? null}
      />

      {/* Upcoming sessions */}
      <UpcomingPlaySessionsSection
        sessions={upcomingSessions}
        hasError={hasUpcomingSessionsError}
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
