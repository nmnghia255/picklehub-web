import { startTransition, useEffect, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type { PlaySession, PlaySessionStatus } from "../../types"

interface PlaySessionModalProps {
  open: boolean
  onClose: () => void
  session: PlaySession | null
  socialId: string
}

export function PlaySessionModal({
  open,
  onClose,
  session,
  socialId,
}: PlaySessionModalProps) {
  const { t } = useSocialsTranslation()
  const [formData, setFormData] = useState({
    title: "",
    status: "DRAFT" as PlaySessionStatus,
    maxSlots: 16,
    startTime: "",
    endTime: "",
  })

  useEffect(() => {
    startTransition(() => {
      if (session) {
        setFormData({
          title: session.title,
          status: session.status,
          maxSlots: session.maxSlots,
          startTime: new Date(session.startTime).toISOString().slice(0, 16),
          endTime: new Date(session.endTime).toISOString().slice(0, 16),
        })
      } else {
        setFormData({
          title: "",
          status: "DRAFT",
          maxSlots: 16,
          startTime: "",
          endTime: "",
        })
      }
    })
  }, [session, open])

  const handleSubmit = () => {
    console.log("Saving play session:", formData, socialId)
    alert(session ? t("form.updateSuccess") : t("form.createSuccess"))
    onClose()
  }

  const getStatusLabel = (status: PlaySessionStatus) => {
    switch (status) {
      case "DRAFT":
        return t("labels.draft")
      case "PUBLISHED":
        return t("labels.published")
      case "COMPLETED":
        return t("labels.completed")
      case "CANCELLED":
        return t("labels.cancelled")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {session ? t("sessions.editSession") : t("sessions.createSession")}
          </DialogTitle>
          <DialogDescription>{t("form.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="play-session-title">{t("form.sessionTitle")}</Label>
            <Input
              id="play-session-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Morning Session - Courts 1 & 2"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>{t("filters.status")}</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as PlaySessionStatus })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("filters.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                {(
                  ["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"] as const
                ).map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="play-session-max-slots">{t("form.maxSlots")}</Label>
            <Input
              id="play-session-max-slots"
              type="number"
              value={formData.maxSlots}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxSlots: parseInt(e.target.value) || 0,
                })
              }
              min={1}
              max={100}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="play-session-start-time">
              {t("form.startTime")}
            </Label>
            <Input
              id="play-session-start-time"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="play-session-end-time">{t("form.endTime")}</Label>
            <Input
              id="play-session-end-time"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              required
            />
          </div>

          {formData.startTime &&
            formData.endTime &&
            new Date(formData.endTime) <= new Date(formData.startTime) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {t("form.validationEndAfterStart")}
                </AlertDescription>
              </Alert>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("dialogs.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !formData.title ||
              !formData.startTime ||
              !formData.endTime ||
              formData.maxSlots < 1 ||
              new Date(formData.endTime) <= new Date(formData.startTime)
            }
          >
            {session ? t("form.update") : t("form.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
