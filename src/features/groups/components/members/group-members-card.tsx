"use client"

import { useQuery } from "@tanstack/react-query"
import type { TFunction } from "i18next"
import { Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import {
  getGroupMembersClient,
  groupQueryKeys,
  useSyncGroupData,
} from "../../api/groups-client"
import type { Member } from "../../types"
import { isArchivedGroup } from "../../utils/group-status"
import { GroupMemberActions } from "./group-member-actions"

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "MB"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
}

function normalizeRole(
  role: string | null | undefined,
  t: TFunction<"groups">
) {
  switch (role?.toLowerCase()) {
    case "owner":
      return t("dashboard.roleOwner", "Trưởng nhóm")
    case "member":
      return t("members")
    default:
      return role ?? "-"
  }
}

interface GroupMembersCardProps {
  groupId: string
  initialMembers?: Member[]
  currentUserId: string
  currentUserRole: string | null
  groupStatus?: string | null
}

export function GroupMembersCard({
  groupId,
  initialMembers,
  currentUserId,
  currentUserRole,
  groupStatus,
}: GroupMembersCardProps) {
  const { t } = useGroupsTranslation()
  const queryKey = groupQueryKeys.members(groupId)
  useSyncGroupData(queryKey, initialMembers)

  const { data: members } = useQuery({
    queryKey,
    queryFn: () => getGroupMembersClient(groupId),
    initialData: initialMembers,
  })

  const resolvedMembers: Member[] = Array.isArray(members)
    ? members
    : members &&
        typeof members === "object" &&
        "data" in members &&
        Array.isArray((members as Record<string, unknown>).data)
      ? ((members as Record<string, unknown>).data as Member[])
      : []

  const normalizedUserRole = currentUserRole?.toLowerCase()
  const canManageMembers =
    !isArchivedGroup(groupStatus) && normalizedUserRole === "owner"

  return (
    <Card className="group-feature-root mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="size-5 text-base" />
          <CardTitle>{t("members")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <colgroup>
            <col style={{ width: "30%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>
                {t("activitySchedule.formFieldName", "Tên")}
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>{t("dashboard.thRole", "Vai trò")}</TableHead>
              <TableHead>
                {t("dashboard.thJoinedAt", "Ngày tham gia")}
              </TableHead>
              {canManageMembers && (
                <TableHead className="text-right">
                  {t("activitySchedule.thAction", "Thao tác")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {resolvedMembers.map((member) => (
              <TableRow key={member.userId}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage
                        src={member.avatarUrl ?? undefined}
                        alt={member.name}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <span>{member.name}</span>
                      {member.userId === currentUserId && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          {t("dashboard.badgeYou", "Bạn")}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="truncate overflow-hidden text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell className="capitalize">
                  {normalizeRole(member.role, t)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(member.joinedAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                {canManageMembers && (
                  <TableCell className="text-right">
                    <GroupMemberActions
                      groupId={groupId}
                      memberId={member.userId}
                      memberName={member.name}
                      memberRole={member.role}
                      currentUserId={currentUserId}
                      currentUserRole={currentUserRole ?? ""}
                      isEditable={!isArchivedGroup(groupStatus)}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
