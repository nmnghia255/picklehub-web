import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GroupActivitySchedulePage } from "@/features/group-activity-schedule/components/group-activity-schedule-page"
import { GroupChat } from "@/features/groups/components/group-chat"
import type { Group, Invitation } from "@/features/groups/types"
import { GroupFeedNotificationsContainer } from "@/features/notifications/components/group-feed-notifications-container"
import type { GroupPlaySession } from "@/features/play-sessions/types"

import { isArchivedGroup } from "../utils/group-status"
import { GroupDetailTabs } from "./group-detail-tabs"
import { GroupFinanceSection } from "./group-finance-section"
import { GroupMembersCard } from "./group-members-card"
import { GroupOverviewCard } from "./group-overview-card"
import { InvitationsTable } from "./invitations-table"
import { UpcomingPlaySessionsSection } from "./upcoming-play-sessions-section"

interface GroupDetailPanelsProps {
  groupId: string
  group: Group
  currentUserId: string
  currentUserRole: string | null
  invitations: Invitation[]
  upcomingSessions: GroupPlaySession[]
  hasUpcomingSessionsError: boolean
  defaultTab?: "overview" | "sessions" | "activity" | "finance" | "chat"
}

export async function GroupDetailPanels({
  groupId,
  group,
  currentUserId,
  currentUserRole,
  invitations,
  upcomingSessions,
  hasUpcomingSessionsError,
  defaultTab,
}: GroupDetailPanelsProps) {
  const isOwner = group.role === "owner"

  const overviewPanel = (
    <div className="space-y-6 lg:space-y-8">
      <GroupOverviewCard group={group} />

      <GroupMembersCard
        groupId={groupId}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        groupStatus={group.status}
      />

      <GroupFeedNotificationsContainer groupId={groupId} />

      {isOwner && (
        <Card>
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

  const sessionsPanel = (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Buổi chơi sắp tới
          </h2>
          <p className="text-sm text-muted-foreground">
            Xem nhanh lịch chơi hiện tại của nhóm và tạo buổi mới khi cần.
          </p>
        </div>
        {!isArchivedGroup(group.status) && (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href={`/groups/${groupId}/create-play-session`}>
              Tạo buổi chơi
            </Link>
          </Button>
        )}
      </div>

      <UpcomingPlaySessionsSection
        sessions={upcomingSessions}
        hasError={hasUpcomingSessionsError}
      />
    </div>
  )

  return (
    <GroupDetailTabs
      overview={overviewPanel}
      sessions={sessionsPanel}
      activity={<GroupActivitySchedulePage initialGroupId={groupId} embedded />}
      finance={
        <div className="min-w-0">
          <GroupFinanceSection
            groupId={groupId}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            groupStatus={group.status}
          />
        </div>
      }
      chat={
        <div className="h-[70vh] min-h-136 min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm">
          <GroupChat groupId={groupId} fullPage />
        </div>
      }
      defaultValue={defaultTab}
    />
  )
}
