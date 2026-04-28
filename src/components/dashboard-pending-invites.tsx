"use client"

import { CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface PendingInvite {
  id: string
  groupName: string
  invitedBy: string
  createdAt: string
}

interface DashboardPendingInvitesProps {
  invites: PendingInvite[]
  isLoading?: boolean
  onAccept?: (inviteId: string) => void
  onDecline?: (inviteId: string) => void
}

export function DashboardPendingInvites({
  invites = [],
  isLoading = false,
  onAccept,
  onDecline,
}: DashboardPendingInvitesProps) {
  if (isLoading) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">Đang tải dữ liệu...</p>
      </Card>
    )
  }

  if (invites.length === 0) {
    return null
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Lời Mời Chờ Xử Lý</h3>
        <p className="text-sm text-muted-foreground">
          Bạn có {invites.length} lời mời từ nhóm khác
        </p>
      </div>

      <div className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1">
              <p className="font-medium">{invite.groupName}</p>
              <p className="text-xs text-muted-foreground">
                Lời mời từ {invite.invitedBy}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecline?.(invite.id)}
                className="flex-1 sm:flex-none"
              >
                <XCircle className="mr-2 size-4" />
                Từ Chối
              </Button>
              <Button
                size="sm"
                onClick={() => onAccept?.(invite.id)}
                className="flex-1 sm:flex-none"
              >
                <CheckCircle2 className="mr-2 size-4" />
                Chấp Nhận
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
