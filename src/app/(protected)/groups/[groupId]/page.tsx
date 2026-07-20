import { ErrorSection } from "@/components/error-section"
import { PageContainer } from "@/components/page-container"
import {
  getGroup,
  getGroupInvitations,
  getGroupMembers,
} from "@/features/groups/api/groups-service"
import { EditGroupDrawer } from "@/features/groups/components/details/edit-group-drawer"
import { GroupDetailActionsMenu } from "@/features/groups/components/details/group-detail-actions-menu"
import { GroupDetailHeader } from "@/features/groups/components/details/group-detail-header"
import { GroupDetailPanels } from "@/features/groups/components/details/group-detail-panels"
import { GroupSubscriptionBanner } from "@/features/groups/components/details/group-subscription-banner"
import { GroupInviteMemberButton } from "@/features/groups/components/members/group-invite-member-button"
import { GroupFeedNotificationSender } from "@/features/notifications/components/group-feed-notification-sender"
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
}

export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  const { groupId } = await params
  const session = await getSession()
  const defaultTab = "overview"

  let group
  let members = []
  let invitations = []
  let isOwner = false
  let canManage = false

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

    const normalizedRole = group.role?.toLowerCase()
    isOwner = normalizedRole === "owner"
    canManage = isOwner || normalizedRole === "admin"

    invitations = canManage ? await getGroupInvitations(groupId) : []
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

  const archived = group.status === "ARCHIVED"

  return (
    <PageContainer variant="wide" className="space-y-6">
      <GroupSubscriptionBanner group={group} currentUserRole={group.role} />
      <div className="border-b pb-4 lg:pb-5">
        <GroupDetailHeader
          groupId={groupId}
          initialData={group}
          actions={
            <>
              {!archived && canManage && (
                <GroupFeedNotificationSender
                  groupId={groupId}
                  groupName={group.name}
                  canSend={canManage}
                />
              )}
              {!archived && canManage && <EditGroupDrawer group={group} />}
              {!archived && canManage && (
                <GroupInviteMemberButton
                  groupId={groupId}
                  groupName={group.name}
                />
              )}
              <GroupDetailActionsMenu
                group={group}
                isOwner={isOwner}
                isArchived={archived}
              />
            </>
          }
        />
      </div>

      <div className="w-full min-w-0">
        <GroupDetailPanels
          groupId={groupId}
          group={group}
          members={members}
          currentUserId={session.user?.id ?? ""}
          currentUserRole={group.role ?? null}
          invitations={invitations}
          defaultTab={defaultTab}
        />
      </div>
    </PageContainer>
  )
}
