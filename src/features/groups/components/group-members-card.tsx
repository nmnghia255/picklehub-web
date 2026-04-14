import { ErrorSection } from "@/components/error-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { getGroupMembers } from "../api/groups-service"

function normalizeRole(role: string | null | undefined) {
  switch (role) {
    case "owner":
      return "Trưởng nhóm"
    case "user":
      return "Thành viên"
    default:
      return role
  }
}

export async function GroupMembersCard({ groupId }: { groupId: string }) {
  const members = await getGroupMembers(groupId).catch((error) => {
    console.error("Error loading group members:", error)
    return null
  })

  if (!members) {
    return (
      <ErrorSection message="Đã xảy ra lỗi khi tải thông tin thành viên. Vui lòng thử lại sau." />
    )
  }

  return (
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
  )
}
