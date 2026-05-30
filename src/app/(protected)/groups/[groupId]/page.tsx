import { DeleteStatusToast } from "@/components/delete-status-toast"
import { ErrorSection } from "@/components/error-section"
import { PageContainer } from "@/components/page-container"
import {
  getGroup,
  getGroupMembers,
  getGroupInvitations,
} from "@/features/groups/api/groups-service"
import { GroupDetailActionsMenu } from "@/features/groups/components/group-detail-actions-menu"
import { GroupDetailHeader } from "@/features/groups/components/group-detail-header"
import { GroupDetailPanels } from "@/features/groups/components/group-detail-panels"
import { GroupInviteMemberButton } from "@/features/groups/components/group-invite-member-button"
import { GroupFeedNotificationSender } from "@/features/notifications/components/group-feed-notification-sender"
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
  searchParams: Promise<{
    delete?: string
    view?: string
  }>
}

export default async function GroupDetailPage({
  params,
  searchParams,
}: GroupDetailPageProps) {
  const { groupId } = await params
  const { delete: deleteStatus, view } = await searchParams
  const session = await getSession()
  const defaultTab = view === "chat" ? "chat" : "overview"

  let group
  let members = []
  let invitations = []
  let isOwner = false
  let upcomingSessions: GroupPlaySession[] = []
  let hasUpcomingSessionsError = false

  try {
    const [groupResult, membersResult] = await Promise.all([
      getGroup(groupId),
      getGroupMembers(groupId).catch((error) => {
        console.error("Error loading group members:", error)
        return []
      }),
    ])

    group = groupResult
    members = membersResult

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
      <PageContainer variant="wide" className="space-y-6">
        <ErrorSection className="mb-4" message={message} />
      </PageContainer>
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
    const status = getHttpStatus(error)

    if (status !== 404) {
      console.error("Error loading upcoming sessions:", error)
    }

    hasUpcomingSessionsError = true
  }

  return (
    <PageContainer variant="wide" className="space-y-6">
      <DeleteStatusToast
        status={deleteStatus}
        successMessage="Xoa buoi choi thanh cong."
      />

      <div className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6 lg:pb-5">
        <div className="min-w-0 flex-1">
          <GroupDetailHeader
            groupId={groupId}
            groupName={group.name}
            isOwner={isOwner}
            groupStatus={group.status}
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 lg:justify-end">
          {isOwner && (
            <GroupFeedNotificationSender
              groupId={groupId}
              groupName={group.name}
              canSend={isOwner}
            />
          )}
          {isOwner && (
            <GroupInviteMemberButton groupId={groupId} groupName={group.name} />
          )}
          <GroupDetailActionsMenu
            groupId={groupId}
            groupName={group.name}
            isOwner={isOwner}
            isArchived={group.status === "ARCHIVED"}
          />
        </div>
      </div>

      <div className="w-full min-w-0">
        <GroupDetailPanels
          groupId={groupId}
          group={group}
          members={members}
          currentUserId={session.user?.id ?? ""}
          currentUserRole={group.role ?? null}
          invitations={invitations}
          upcomingSessions={upcomingSessions}
          hasUpcomingSessionsError={hasUpcomingSessionsError}
          defaultTab={defaultTab}
        />
      </div>
    </PageContainer>
  )
}
