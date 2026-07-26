"use client"

import { CheckCircle2, Mail, XCircle } from "lucide-react"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation("common")

  if (isLoading) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">
          {t("dashboard.pendingInvites.loading")}
        </p>
      </Card>
    )
  }

  if (invites.length === 0) {
    return null
  }

  return (
    <Card className="p-6 transition-all duration-200 hover:shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400">
          <Mail className="size-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {t("dashboard.pendingInvites.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.pendingInvites.description", {
              count: invites.length,
            })}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1">
              <p className="font-medium">{invite.groupName}</p>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.pendingInvites.invitedBy", {
                  name: invite.invitedBy,
                })}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecline?.(invite.id)}
                className="flex-1 sm:flex-none"
              >
                <XCircle className="mr-2 size-4 text-rose-500" />
                {t("dashboard.pendingInvites.decline")}
              </Button>
              <Button
                size="sm"
                onClick={() => onAccept?.(invite.id)}
                className="flex-1 sm:flex-none"
              >
                <CheckCircle2 className="mr-2 size-4 text-white" />
                {t("dashboard.pendingInvites.accept")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
