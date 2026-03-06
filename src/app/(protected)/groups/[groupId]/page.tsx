import { CalendarDays, Users } from "lucide-react"

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
  getGroup,
  getGroupInvitations,
  getGroupMembers,
} from "@/features/groups/api/groups-service"
import { InvitationsTable } from "@/features/groups/components/invitations-table"
import { InviteDialog } from "@/features/groups/components/invite-dialog"
import { InviteLinksDrawer } from "@/features/groups/components/invite-links-drawer"

interface GroupDetailPageProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  const { groupId } = await params
  const [group, members] = await Promise.all([
    getGroup(groupId),
    getGroupMembers(groupId),
  ])

  const isOwner = group.role === "owner"
  const invitations = isOwner ? await getGroupInvitations(groupId) : []

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        {isOwner && (
          <div className="flex gap-2">
            <InviteDialog groupId={groupId} />
            <InviteLinksDrawer groupId={groupId} />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin nhóm</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {group.description && (
            <p className="text-sm text-muted-foreground">{group.description}</p>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" />
            <span>{group.memberCount} thành viên</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            <span>
              Ngày tạo:{" "}
              {new Date(group.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Thành viên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày tham gia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell className="capitalize">{member.role}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.joinedAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
