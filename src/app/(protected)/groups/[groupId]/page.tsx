import { ChevronLeft, MessageSquare } from "lucide-react"
import Link from "next/link"

import { DeleteStatusToast } from "@/components/delete-status-toast"
import { ErrorSection } from "@/components/error-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  getGroup,
  getGroupInvitations,
} from "@/features/groups/api/groups-service"
import { GroupChat } from "@/features/groups/components/group-chat"
import { GroupDetailHeader } from "@/features/groups/components/group-detail-header"
import { GroupMembersCard } from "@/features/groups/components/group-members-card"
import { GroupOverviewCard } from "@/features/groups/components/group-overview-card"
import { InvitationsTable } from "@/features/groups/components/invitations-table"
import { UpcomingPlaySessionsSection } from "@/features/groups/components/upcoming-play-sessions-section"
import { GroupFeedNotificationSender } from "@/features/notifications/components/group-feed-notification-sender"
import { GroupFeedNotificationsContainer } from "@/features/notifications/components/group-feed-notifications-container"
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
  searchParams: Promise<{ delete?: string; view?: string }>
}

export default async function GroupDetailPage({
  params,
  searchParams,
}: GroupDetailPageProps) {
  const { groupId } = await params
  const { delete: deleteStatus, view } = await searchParams
  const session = await getSession()
  const isChatView = view === "chat"

  let group
  let invitations = []
  let isOwner = false
  let upcomingSessions: GroupPlaySession[] = []
  let hasUpcomingSessionsError = false

  try {
    group = await getGroup(groupId)

    isOwner = group.role === "owner"
    invitations =
      !isChatView && isOwner ? await getGroupInvitations(groupId) : []
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

  if (!isChatView) {
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
  }

  if (isChatView) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm text-muted-foreground">Nhóm</p>
            <h1 className="text-xl font-semibold">{group.name}</h1>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href={`/groups/${groupId}`}>
              <ChevronLeft className="mr-2 size-4" />
              Trở lại nhóm
            </Link>
          </Button>
        </div>

        <div className="min-h-0 flex-1">
          <GroupChat groupId={groupId} fullPage />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <DeleteStatusToast
        status={deleteStatus}
        successMessage="Xoa buoi choi thanh cong."
      />

      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex-1">
          <GroupDetailHeader
            groupId={groupId}
            groupName={group.name}
            isOwner={isOwner}
            groupStatus={group.status}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isOwner && (
            <GroupFeedNotificationSender
              groupId={groupId}
              groupName={group.name}
              canSend={isOwner}
            />
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/groups/${groupId}?view=chat`}>
              <MessageSquare className="mr-2 size-4" />
              Mở chat
            </Link>
          </Button>
        </div>
      </div>

      <>
        <GroupOverviewCard group={group} />

        <div className="mt-6 space-y-6">
          <GroupMembersCard
            groupId={groupId}
            currentUserId={session.user?.id ?? ""}
            currentUserRole={group.role ?? null}
            groupStatus={group.status}
          />

          <GroupFeedNotificationsContainer groupId={groupId} />

          <UpcomingPlaySessionsSection
            sessions={upcomingSessions}
            hasError={hasUpcomingSessionsError}
          />
        </div>

        {isOwner && (
          <Card className="mt-6">
            <CardContent>
              <InvitationsTable
                groupId={groupId}
                initialInvitations={invitations}
              />
            </CardContent>
          </Card>
        )}
      </>
    </div>
  )
}
