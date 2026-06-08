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

import type { PlaySession } from "../../types/play-session"

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  socialId,
}: PlaySessionModalProps) {
  const { t } = useSocialsTranslation()
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startTime: "",
    endTime: "",
    fee: "",
    bookings: "",
  })

  useEffect(() => {
    startTransition(() => {
      if (session) {
        setFormData({
          title: session.title,
          location: session.location,
          startTime: new Date(session.startTime).toISOString().slice(0, 16),
          endTime: new Date(session.endTime).toISOString().slice(0, 16),
          fee: session.sessionFee.toString(),
          bookings: "",
        })
      } else {
        setFormData({
          title: "",
          location: "",
          startTime: "",
          endTime: "",
          fee: "",
          bookings: "",
        })
      }
    })
  }, [session, open])

  const handleSubmit = () => {
    alert(session ? t("form.updateSuccess") : t("form.createSuccess"))
    onClose()
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
            <Label htmlFor="play-session-title">{t("form.location")}</Label>
            <Input
              id="play-session-title"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Sports Center ABC, 123 Main St"
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

          <div className="grid gap-2">
            <Label htmlFor="play-session-fee">{t("form.fee")}</Label>
            <Input
              id="play-session-fee"
              type="number"
              value={formData.fee}
              onChange={(e) =>
                setFormData({ ...formData, fee: e.target.value })
              }
              min={0}
              step={0.01}
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

        <div className="grid gap-2">
          <Label htmlFor="play-session-fee">{t("form.bookings")}</Label>
          <Select>
            <SelectTrigger id="play-session-booking" className="w-full">
              <SelectValue placeholder={t("form.bookings")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="court1">{t("courts.court1")}</SelectItem>
              <SelectItem value="court2">{t("courts.court2")}</SelectItem>
              <SelectItem value="court3">{t("courts.court3")}</SelectItem>
            </SelectContent>
          </Select>
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
