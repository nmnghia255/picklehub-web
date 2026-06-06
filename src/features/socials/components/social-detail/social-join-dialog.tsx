"use client"

import { format } from "date-fns"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PlaySession } from "@/features/socials/types/play-session"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

export default function SocialJoinDialog({
  open,
  onOpenChange,
  title,
  autoApproveJoinRequests,
  sessions,
  onConfirm,
  isJoining,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  autoApproveJoinRequests: boolean
  sessions?: PlaySession[]
  onConfirm?: (sessionIds: string[]) => void
  isJoining?: boolean
}) {
  const { t } = useSocialsTranslation()
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([])

  // Reset selection when dialog opens
  React.useEffect(() => {
    if (open && sessions?.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSessionIds([])
    }
  }, [open, sessions])

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(selectedSessionIds)
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogs.joinTitle", { title })}</DialogTitle>
          <DialogDescription>{t("dialogs.joinDescription")}</DialogDescription>
        </DialogHeader>

        {sessions && sessions.length > 0 && (
          <div className="space-y-3 py-4">
            <div className="text-sm font-medium">
              {t("dialogs.selectSessions", {
                defaultValue: "Select play sessions to join:",
              })}
            </div>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start space-x-3 rounded-md border p-3"
                >
                  <Checkbox
                    id={session.id}
                    checked={selectedSessionIds.includes(session.id)}
                    onCheckedChange={(checked) => {
                      if (checked === true) {
                        setSelectedSessionIds([
                          ...selectedSessionIds,
                          session.id,
                        ])
                      } else {
                        setSelectedSessionIds(
                          selectedSessionIds.filter((id) => id !== session.id)
                        )
                      }
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={session.id}
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {session.title || t("common.playSession")}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.startTime), "PPp")} -{" "}
                      {format(new Date(session.endTime), "p")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          {autoApproveJoinRequests
            ? t("dialogs.autoApproved")
            : t("dialogs.manualApproval")}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isJoining}
          >
            {t("dialogs.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isJoining ||
              (sessions &&
                sessions.length > 0 &&
                selectedSessionIds.length === 0)
            }
          >
            {isJoining
              ? t("dialogs.joining", { defaultValue: "Joining..." })
              : t("dialogs.confirmJoin")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
