"use client"

import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  getGroupMembersClient,
  groupQueryKeys,
  useSyncGroupData,
} from "../api/groups-client"
import type { Member } from "../types"
import { isArchivedGroup } from "../utils/group-status"
import { GroupMemberActions } from "./group-member-actions"

function normalizeRole(role: string | null | undefined) {
  switch (role?.toLowerCase()) {
    case "owner":
      return "Trưởng nhóm"
    case "admin":
      return "Quản trị"
    case "member":
      return "Thành viên"
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
  const queryKey = groupQueryKeys.members(groupId)
  useSyncGroupData(queryKey, initialMembers)

  const { data: members } = useQuery({
    queryKey,
    queryFn: () => getGroupMembersClient(groupId),
    initialData: initialMembers,
  })

  const resolvedMembers = members ?? []

  const normalizedUserRole = currentUserRole?.toLowerCase()
  const canManageMembers =
    !isArchivedGroup(groupStatus) &&
    (normalizedUserRole === "owner" || normalizedUserRole === "admin")

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Thành viên</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "40%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              {canManageMembers && (
                <TableHead className="text-right">Thao tác</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {resolvedMembers.map((member) => (
              <TableRow key={member.userId}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{member.name}</span>
                    {member.userId === currentUserId && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Bạn
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="truncate overflow-hidden text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell className="capitalize">
                  {normalizeRole(member.role)}
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
