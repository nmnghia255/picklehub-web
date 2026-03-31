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

interface Participant {
  userId: string
  joinedAt?: string
  displayName?: string
}

interface PlaySessionParticipantsProps {
  participants: Participant[]
  error?: string | null
}

export function PlaySessionParticipants({
  participants,
  error,
}: PlaySessionParticipantsProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Danh sách người tham gia</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có người tham gia buổi chơi này.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người tham gia</TableHead>
                <TableHead>Thời gian tham gia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={`${participant.userId}-${participant.joinedAt}`}>
                  <TableCell className="font-medium">
                    {participant.displayName || participant.userId}
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
  )
}
