"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { CourtInfo } from "../../types/tournament-court"

interface ManualScheduleFormProps {
  courtsList: CourtInfo[]
  timeSlots: string[]
  onSubmit: (courtId: string, timeSlot: string) => void
  onClose: () => void
}

export function ManualScheduleForm({
  courtsList,
  timeSlots,
  onSubmit,
  onClose,
}: ManualScheduleFormProps) {
  const { t } = useTournamentTranslation()
  const [selectedCourt, setSelectedCourt] = useState(
    courtsList[0]?.courtId || ""
  )
  const [selectedTime, setSelectedTime] = useState(timeSlots[0] || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourt || !selectedTime) {
      toast.error(
        t("scheduling.toasts.selectCourtAndTime", {
          defaultValue: "Please select both court and time slot",
        })
      )
      return
    }
    onSubmit(selectedCourt, selectedTime)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="manual-court">
          {t("scheduling.manual.selectCourt", { defaultValue: "Select Court" })}
        </Label>
        <Select value={selectedCourt} onValueChange={setSelectedCourt}>
          <SelectTrigger id="manual-court" className="mt-1.5 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {courtsList.map((court) => (
              <SelectItem key={court.courtId} value={court.courtId}>
                {court.courtName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="manual-time">
          {t("scheduling.manual.selectTime", {
            defaultValue: "Select Match Time",
          })}
        </Label>
        <Select value={selectedTime} onValueChange={setSelectedTime}>
          <SelectTrigger id="manual-time" className="mt-1.5 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("scheduling.manual.close", { defaultValue: "Close" })}
        </Button>
        <Button
          type="submit"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {t("scheduling.manual.scheduleBtn", {
            defaultValue: "Schedule Match",
          })}
        </Button>
      </div>
    </form>
  )
}
