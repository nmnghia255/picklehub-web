import { Card, CardContent } from "@/components/ui/card"
import { GroupActivitySchedulePage } from "@/features/group-activity-schedule"
import type { Group, Invitation, Member } from "@/features/groups/types"
import { GroupFeedNotificationsContainer } from "@/features/notifications/components/group-feed-notifications-container"

import { GroupCourtBookingsSection } from "../bookings/group-court-bookings-section"
import { GroupEquipmentSection } from "../equipment/group-equipment-section"
import { GroupFinanceSection } from "../finance/group-finance-section"
import { GroupMembersCard } from "../members/group-members-card"
import { InvitationsTable } from "../members/invitations-table"
import { GroupDetailTabs } from "./group-detail-tabs"
import { GroupOverviewCard } from "./group-overview-card"

interface GroupDetailPanelsProps {
  groupId: string
  group: Group
  members: Member[]
  currentUserId: string
  currentUserRole: string | null
  invitations: Invitation[]
  defaultTab?: "overview" | "activity" | "finance" | "court-bookings"
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
  const isArchived = group.status === "ARCHIVED"
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
        <Card className="group-feature-root">
          <CardContent>
            <InvitationsTable
              groupId={groupId}
              initialInvitations={invitations}
              isArchived={isArchived}
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
          currentUserId={currentUserId}
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
        <GroupEquipmentSection
          groupId={groupId}
          canManage={canManage && !isArchived}
        />
      }
      defaultValue={
        defaultTab === "court-bookings" ? "court-bookings" : defaultTab
      }
    />
  )
}
