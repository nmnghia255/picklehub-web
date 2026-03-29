import { CalendarDays, Plus, Users } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
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
import { UpcomingPlaySessionsSection } from "@/features/groups/components/upcoming-play-sessions-section"
import { listGroupPlaySessions } from "@/features/play-sessions/api/group-play-sessions-service"

function normalizeRole(role: string | null | undefined) {
  switch (role) {
    case "OWNER":
      return "Chủ nhóm"
    case "USER":
      return "Thành viên"
    default:
      return role
  }
}

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
  const playSessions = await listGroupPlaySessions(groupId, {
    status: "SCHEDULED",
    limit: 10,
  })
  const invitations = isOwner ? await getGroupInvitations(groupId) : []

  // Filter for upcoming sessions (start time in future)
  const now = new Date()
  const upcomingSessions = playSessions.filter(
    (session) => new Date(session.startTime) > now
  )

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <div className="flex gap-2">
          <Link href={`/groups/${groupId}/create-play-session`}>
            <Button variant="default" size="sm">
              <Plus className="mr-2 size-4" />
              Tạo buổi chơi
            </Button>
          </Link>
          {isOwner && <InviteDialog groupId={groupId} />}
        </div>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UpcomingPlaySessionsSection sessions={upcomingSessions} />

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
