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
import { formatCurrencyVnd } from "@/utils/expense-utils"

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
  const [prevOpen, setPrevOpen] = useState(open)

  // Reset selection when dialog opens
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open && sessions?.length) {
      if (sessions.length === 1) {
        const firstSession = sessions[0]
        const isFull =
          firstSession.maxSlot != null &&
          (firstSession.joinedCount ?? 0) >= firstSession.maxSlot
        const isClosed =
          firstSession.status !== "ACTIVE" &&
          firstSession.status !== "PUBLISHED"
        if (!isFull && !isClosed) {
          setSelectedSessionIds([firstSession.id])
        } else {
          setSelectedSessionIds([])
        }
      } else {
        setSelectedSessionIds([])
      }
    }
  }

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
          <div className="space-y-4 py-2">
            <div className="text-sm font-medium">
              {t("dialogs.selectSessions")}
            </div>
            <div className="max-h-75 space-y-2 overflow-y-auto pr-1">
              {sessions.map((session) => {
                const isFull =
                  session.maxSlot != null &&
                  (session.joinedCount ?? 0) >= session.maxSlot
                const isClosed =
                  session.status !== "ACTIVE" && session.status !== "PUBLISHED"
                const isDisabled = isFull || isClosed
                const isChecked = selectedSessionIds.includes(session.id)

                const toggleSelection = () => {
                  if (isDisabled) return
                  if (isChecked) {
                    setSelectedSessionIds(
                      selectedSessionIds.filter((id) => id !== session.id)
                    )
                  } else {
                    setSelectedSessionIds([...selectedSessionIds, session.id])
                  }
                }

                return (
                  <div
                    key={session.id}
                    onClick={toggleSelection}
                    className={`flex items-start space-x-3 rounded-md border bg-background p-3 transition-colors ${
                      isDisabled
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:bg-muted/30"
                    }`}
                  >
                    <Checkbox
                      id={session.id}
                      checked={isChecked}
                      disabled={isDisabled}
                      onCheckedChange={() => toggleSelection()}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="grid flex-1 gap-1.5 leading-none">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor={session.id}
                          className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelection()
                          }}
                        >
                          {session.title || t("common.playSession")}
                        </label>
                        <div className="flex items-center gap-2">
                          {isFull && (
                            <span className="text-xs font-medium text-destructive">
                              {t("sidebar.full")}
                            </span>
                          )}
                          {session.sessionFee != null && (
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">
                              {formatCurrencyVnd(session.sessionFee)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(session.startTime), "PPp")} -{" "}
                        {format(new Date(session.endTime), "p")}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
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
            {isJoining ? t("dialogs.joining") : t("dialogs.confirmJoin")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
