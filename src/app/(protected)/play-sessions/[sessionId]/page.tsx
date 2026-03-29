import { CalendarDays, Clock3, Users } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
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
  getPublicPlaySessionDetail,
  listPublicPlaySessionParticipants,
} from "@/features/play-sessions/api/public-play-sessions-service"

interface PlaySessionDetailPageProps {
  params: Promise<{ sessionId: string }>
}

function normalizeStatus(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "Lên lịch"
    case "IN_PROGRESS":
      return "Đang diễn ra"
    case "COMPLETED":
      return "Hoàn thành"
    case "CANCELLED":
      return "Đã hủy"
    default:
      return status
  }
}

export default async function PlaySessionDetailPage({
  params,
}: PlaySessionDetailPageProps) {
  const { sessionId } = await params

  const [playSession, participantsResult] = await Promise.all([
    getPublicPlaySessionDetail(sessionId),
    listPublicPlaySessionParticipants(sessionId, { page: 1, limit: 100 }),
  ])

  const participants = participantsResult.participants

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{playSession.title}</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/play-sessions">Quay lại</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin buổi chơi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {playSession.description && (
            <p className="text-sm text-muted-foreground">
              {playSession.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="uppercase">
              {normalizeStatus(playSession.status)}
            </Badge>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              <span>
                Bắt đầu:{" "}
                {new Date(playSession.startTime).toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock3 className="size-4" />
              <span>
                Kết thúc:{" "}
                {new Date(playSession.endTime).toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="size-4" />
              <span>
                Số người tham gia:{" "}
                {playSession.joinedCount ?? participants.length}
                {playSession.maxSlots ? ` / ${playSession.maxSlots}` : ""}
              </span>
            </div>
            <div>
              <span>ID người tạo: {playSession.creatorId}</span>
            </div>
            <div>
              <span>
                Tạo lúc:{" "}
                {new Date(playSession.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
            <div>
              <span>
                Cập nhật:{" "}
                {new Date(playSession.updatedAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Danh sách người tham gia</CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có người tham gia buổi chơi này.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Thời gian tham gia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow
                    key={`${participant.userId}-${participant.joinedAt}`}
                  >
                    <TableCell className="font-medium">
                      {participant.userId}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {participant.joinedAt
                        ? new Date(participant.joinedAt).toLocaleString("vi-VN")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
