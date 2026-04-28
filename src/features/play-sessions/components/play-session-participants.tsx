import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { PlaySessionParticipant } from "../types"

interface PlaySessionParticipantsProps {
  participants: PlaySessionParticipant[]
  error?: string | null
}

function isWaitlistParticipant(participant: PlaySessionParticipant) {
  const normalizedStatus = participant.status?.toUpperCase()

  return (
    normalizedStatus === "WAITLISTED" ||
    normalizedStatus === "JOINED" ||
    normalizedStatus === "PENDING"
  )
}

function ParticipantsTable({
  participants,
}: {
  participants: PlaySessionParticipant[]
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Người tham gia</TableHead>
          <TableHead>Số lượng khách</TableHead>
          <TableHead>Thời gian tham gia</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant) => (
          <TableRow key={`${participant.userId}-${participant.joinedAt}`}>
            <TableCell className="font-medium">
              {participant.name || "-"}
            </TableCell>

            <TableCell className="text-muted-foreground">
              {participant.guestsCount ? `${participant.guestsCount}` : "0"}
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
  )
}

export function PlaySessionParticipants({
  participants,
  error,
}: PlaySessionParticipantsProps) {
  const waitlist = participants.filter(isWaitlistParticipant)
  const confirmedParticipants = participants.filter(
    (participant) => !isWaitlistParticipant(participant)
  )

  return (
    <Card className="mt-6">
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <section className="space-y-3">
          <CardTitle>Người tham gia</CardTitle>
          {confirmedParticipants.length === 0 ? (
            <p className="m-2 mt-6 mb-6 text-sm text-muted-foreground">
              Chưa có người tham gia buổi chơi này.
            </p>
          ) : (
            <ParticipantsTable participants={confirmedParticipants} />
          )}
        </section>

        <section className="space-y-3">
          <CardTitle>Danh sách chờ</CardTitle>
          {waitlist.length === 0 ? (
            <p className="m-2 mt-6 mb-6 text-sm text-muted-foreground">
              Chưa có người trong danh sách chờ.
            </p>
          ) : (
            <ParticipantsTable participants={waitlist} />
          )}
        </section>
      </CardContent>
    </Card>
  )
}
