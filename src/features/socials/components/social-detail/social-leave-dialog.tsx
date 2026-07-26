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

export default function SocialLeaveDialog({
  open,
  onOpenChange,
  title,
  sessions = [],
  joinedSessionIds,
  onConfirm,
  isLeaving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  sessions?: PlaySession[]
  joinedSessionIds?: string[]
  onConfirm?: (sessionIds: string[]) => void
  isLeaving?: boolean
}) {
  const { t } = useSocialsTranslation()
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([])
  const [prevOpen, setPrevOpen] = useState(open)

  const availableSessions = React.useMemo(() => {
    if (joinedSessionIds && joinedSessionIds.length > 0) {
      return sessions.filter((s) => joinedSessionIds.includes(s.id))
    }
    return sessions
  }, [sessions, joinedSessionIds])

  // Reset selection when dialog opens
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open && availableSessions.length > 0) {
      setSelectedSessionIds(availableSessions.map((s) => s.id))
    } else if (!open) {
      setSelectedSessionIds([])
    }
  }

  const allSelected =
    availableSessions.length > 0 &&
    selectedSessionIds.length === availableSessions.length

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedSessionIds([])
    } else {
      setSelectedSessionIds(availableSessions.map((s) => s.id))
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
          <DialogTitle>{t("dialogs.leaveTitle", { title })}</DialogTitle>
          <DialogDescription>{t("dialogs.leaveDescription")}</DialogDescription>
        </DialogHeader>

        {availableSessions.length > 0 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("dialogs.selectSessionsToLeave")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleToggleSelectAll}
              >
                {allSelected
                  ? t("dialogs.deselectAll")
                  : t("dialogs.selectAll")}
              </Button>
            </div>
            <div className="max-h-75 space-y-2 overflow-y-auto pr-1">
              {availableSessions.map((session) => {
                const isChecked = selectedSessionIds.includes(session.id)

                const toggleSelection = () => {
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
                    className="flex cursor-pointer items-start space-x-3 rounded-md border bg-background p-3 transition-colors hover:bg-muted/30"
                  >
                    <Checkbox
                      id={`leave-${session.id}`}
                      checked={isChecked}
                      onCheckedChange={() => toggleSelection()}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="grid flex-1 gap-1.5 leading-none">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor={`leave-${session.id}`}
                          className="cursor-pointer text-sm leading-none font-medium"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelection()
                          }}
                        >
                          {session.title || t("common.playSession")}
                        </label>
                        {session.sessionFee != null && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">
                            {formatCurrencyVnd(session.sessionFee)}
                          </span>
                        )}
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLeaving}
          >
            {t("dialogs.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLeaving || selectedSessionIds.length === 0}
          >
            {isLeaving ? t("dialogs.leaving") : t("dialogs.confirmLeaveAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
