import { Card, CardContent } from "@/components/ui/card"
import { GroupActivitySchedulePage } from "@/features/group-activity-schedule/components/group-activity-schedule-page"
import { GroupChat } from "@/features/groups/components/group-chat"
import type { Group, Invitation, Member } from "@/features/groups/types"
import { GroupFeedNotificationsContainer } from "@/features/notifications/components/group-feed-notifications-container"

import { GroupCourtBookingsSection } from "./group-court-bookings-section"
import { GroupDetailTabs } from "./group-detail-tabs"
import { GroupEquipmentSection } from "./group-equipment-section"
import { GroupFinanceSection } from "./group-finance-section"
import { GroupMembersCard } from "./group-members-card"
import { GroupOverviewCard } from "./group-overview-card"
import { InvitationsTable } from "./invitations-table"

interface GroupDetailPanelsProps {
  groupId: string
  group: Group
  members: Member[]
  currentUserId: string
  currentUserRole: string | null
  invitations: Invitation[]
  defaultTab?: "overview" | "activity" | "finance" | "court-bookings" | "chat"
}

export async function GroupDetailPanels({
  groupId,
  group,
  members,
  currentUserId,
  currentUserRole,
  invitations,
  defaultTab,
}: GroupDetailPanelsProps) {
  const normalizedRole = currentUserRole?.toLowerCase()
  const canManage = normalizedRole === "owner" || normalizedRole === "admin"

  const overviewPanel = (
    <div className="space-y-6 lg:space-y-8">
      <GroupOverviewCard groupId={groupId} initialData={group} />

      <GroupMembersCard
        groupId={groupId}
        initialMembers={members}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        groupStatus={group.status}
      />

      <GroupFeedNotificationsContainer groupId={groupId} />

      {canManage && (
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

  return (
    <GroupDetailTabs
      key={defaultTab}
      overview={overviewPanel}
      activity={
        <GroupActivitySchedulePage
          initialGroupId={groupId}
          embedded
          currentUserRole={currentUserRole}
        />
      }
      courtBookings={
        <div className="min-w-0">
          <GroupCourtBookingsSection
            groupId={groupId}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            groupStatus={group.status}
          />
        </div>
      }
      finance={
        <div className="min-w-0">
          <GroupFinanceSection
            groupId={groupId}
            members={members}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            groupStatus={group.status}
          />
        </div>
      }
      equipment={
        <GroupEquipmentSection groupId={groupId} canManage={canManage} />
      }
      chat={
        <div className="h-[70vh] min-h-136 min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm">
          <GroupChat groupId={groupId} fullPage />
        </div>
      }
      defaultValue={
        defaultTab === "court-bookings" ? "court-bookings" : defaultTab
      }
    />
  )
}
