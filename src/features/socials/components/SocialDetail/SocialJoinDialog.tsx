"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSocialsTranslation } from "@/features/socials/use-socials-translation"

export default function SocialJoinDialog({
  open,
  onOpenChange,
  title,
  autoApproveJoinRequests,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  autoApproveJoinRequests: boolean
}) {
  const { t } = useSocialsTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogs.joinTitle", { title })}</DialogTitle>
          <DialogDescription>{t("dialogs.joinDescription")}</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          {autoApproveJoinRequests
            ? t("dialogs.autoApproved")
            : t("dialogs.manualApproval")}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialogs.cancel")}
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            {t("dialogs.confirmJoin")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
