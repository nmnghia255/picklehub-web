"use client"

import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  type PublicPaymentActionState,
  verifyPlaySessionPaymentAction,
} from "@/features/play-sessions/actions/public-play-session-payment"

import type { PlaySessionParticipant } from "../types"

interface PlaySessionParticipantsProps {
  playSessionId: string
  groupId?: string
  participants: PlaySessionParticipant[]
  isHost?: boolean
  error?: string | null
}

const initialState: PublicPaymentActionState = {}

function PaymentStatusBadge({ paymentStatus }: { paymentStatus?: string }) {
  const normalized = String(paymentStatus ?? "UNPAID").toUpperCase()

  if (normalized === "PAID") {
    return (
      <Badge className="bg-green-600 text-white hover:bg-green-600">PAID</Badge>
    )
  }

  if (normalized === "PENDING_REVIEW") {
    return (
      <Badge className="bg-yellow-500 text-black hover:bg-yellow-500">
        PENDING_REVIEW
      </Badge>
    )
  }

  return <Badge variant="outline">UNPAID</Badge>
}

function ParticipantActions({
  playSessionId,
  groupId,
  participant,
}: {
  playSessionId: string
  groupId?: string
  participant: PlaySessionParticipant
}) {
  const router = useRouter()

  const [approveState, approveAction, isApproving] = useActionState(
    verifyPlaySessionPaymentAction.bind(
      null,
      playSessionId,
      participant.userId,
      groupId ?? null
    ),
    initialState
  )

  useEffect(() => {
    if (!approveState.success) {
      return
    }

    router.refresh()
  }, [approveState.success, router])

  if (String(participant.paymentStatus).toUpperCase() !== "PENDING_REVIEW") {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          Xác minh
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Xác minh thanh toán</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Xác nhận người chơi này đã thanh toán để chuyển trạng thái sang PAID.
        </p>

        {approveState.error && (
          <Alert variant="destructive">
            <AlertDescription>{approveState.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <form
            action={(formData) => {
              startTransition(() => approveAction(formData))
            }}
          >
            <Button type="submit" disabled={isApproving}>
              {isApproving ? "Đang xác nhận..." : "Đã nhận tiền"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ParticipantsTable({
  playSessionId,
  groupId,
  participants,
  isHost,
}: {
  playSessionId: string
  groupId?: string
  participants: PlaySessionParticipant[]
  isHost: boolean
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Người tham gia</TableHead>
          <TableHead>Trạng thái thanh toán</TableHead>
          <TableHead>Số lượng khách</TableHead>
          <TableHead>Thời gian tham gia</TableHead>
          {isHost && <TableHead className="text-right">Hành động</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant) => (
          <TableRow key={`${participant.userId}-${participant.joinedAt}`}>
            <TableCell className="font-medium">
              {participant.name || "-"}
            </TableCell>

            <TableCell>
              <PaymentStatusBadge paymentStatus={participant.paymentStatus} />
            </TableCell>

            <TableCell className="text-muted-foreground">
              {participant.guestsCount ? `${participant.guestsCount}` : "0"}
            </TableCell>

            <TableCell className="text-muted-foreground">
              {participant.joinedAt
                ? new Date(participant.joinedAt).toLocaleString("vi-VN")
                : "-"}
            </TableCell>

            {isHost && (
              <TableCell className="text-right">
                <ParticipantActions
                  playSessionId={playSessionId}
                  groupId={groupId}
                  participant={participant}
                />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function PlaySessionParticipants({
  playSessionId,
  groupId,
  participants,
  isHost = false,
  error,
}: PlaySessionParticipantsProps) {
  const officialParticipants = participants.filter(
    (participant) => String(participant.status).toUpperCase() === "JOINED"
  )
  const waitlistParticipants = participants.filter((participant) => {
    const normalizedStatus = String(participant.status).toUpperCase()

    return (
      normalizedStatus !== "JOINED" &&
      normalizedStatus !== "LEFT" &&
      normalizedStatus !== "KICKED"
    )
  })

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Danh sách người tham gia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            Danh sách chính thức (JOINED)
          </h3>
          {officialParticipants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có người tham gia chính thức.
            </p>
          ) : (
            <ParticipantsTable
              playSessionId={playSessionId}
              groupId={groupId}
              participants={officialParticipants}
              isHost={isHost}
            />
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Danh sách chờ (Waitlist)</h3>
          {waitlistParticipants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có người trong danh sách chờ.
            </p>
          ) : (
            <ParticipantsTable
              playSessionId={playSessionId}
              groupId={groupId}
              participants={waitlistParticipants}
              isHost={isHost}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
