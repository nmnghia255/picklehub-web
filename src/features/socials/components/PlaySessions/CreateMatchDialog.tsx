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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export default function CreateMatchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useSocialsTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("matches.createMatch")}</DialogTitle>
          <DialogDescription>{t("matches.scheduleMatch")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label={t("matches.courtNumber")}>
            <Input type="number" />
          </Field>
          <Field label={t("form.startTime")}>
            <Input type="datetime-local" />
          </Field>
          <p className="text-sm text-muted-foreground">
            {t("matches.selectParticipantsHint")}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialogs.cancel")}
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            {t("matches.createMatch")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
