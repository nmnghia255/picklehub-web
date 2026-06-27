"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  createTournamentEventAction,
  updateTournamentEventAction,
} from "../../actions/tournament-event-actions"
import type {
  TournamentEvent,
  TournamentEventGender,
  TournamentEventType,
} from "../../types/tournament-event"

interface EventFormProps {
  tournamentId: string
  editingEvent: TournamentEvent | null
  onClose: () => void
}

export function EventForm({
  tournamentId,
  editingEvent,
  onClose,
}: EventFormProps) {
  const { t } = useTournamentTranslation()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [, startTransition] = useTransition()

  const [name, setName] = useState(editingEvent?.name || "")
  const [type, setType] = useState(
    editingEvent?.type.toLowerCase() || "singles"
  )
  const [gender, setGender] = useState(
    editingEvent?.gender.toLowerCase() || "men"
  )

  const getSkillRangeValues = () => {
    if (!editingEvent?.skillRange) return { min: "3.0", max: "4.5" }
    const [min, max] = editingEvent.skillRange.split("-")
    return { min: min || "3.0", max: max || min || "4.5" }
  }
  const initialRange = getSkillRangeValues()
  const [minRating, setMinRating] = useState(initialRange.min)
  const [maxRating, setMaxRating] = useState(initialRange.max)

  const [capacity, setCapacity] = useState(
    editingEvent ? String(editingEvent.capacity) : "32"
  )
  const [entryFee, setEntryFee] = useState(
    editingEvent ? editingEvent.entryFee.toLocaleString("vi-VN") : "150.000"
  )

  const handleEntryFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "")
    if (!rawValue) {
      setEntryFee("")
      return
    }
    const formatted = Number(rawValue).toLocaleString("vi-VN")
    setEntryFee(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    const eventPayload = {
      name: name.trim(),
      type: (type === "singles"
        ? "Singles"
        : type === "doubles"
          ? "Doubles"
          : "Team") as TournamentEventType,
      gender: (gender === "men"
        ? "Men"
        : gender === "women"
          ? "Women"
          : "Mixed") as TournamentEventGender,
      skillRange: `${minRating}-${maxRating}`,
      capacity: Number(capacity) || 32,
      entryFee: Number(entryFee.replace(/\D/g, "")) || 0,
    }

    try {
      if (editingEvent) {
        const res = await updateTournamentEventAction(
          tournamentId,
          editingEvent.id.toString(),
          eventPayload
        )
        if (res.success) {
          toast.success(
            t("events.updateSuccess", {
              defaultValue: "Event updated successfully",
            })
          )
          startTransition(() => {
            router.refresh()
          })
          onClose()
        } else {
          toast.error(
            res.error ||
              t("events.updateError", {
                defaultValue: "Failed to update event",
              })
          )
        }
      } else {
        const res = await createTournamentEventAction(
          tournamentId,
          eventPayload
        )
        if (res.success) {
          toast.success(
            t("events.createSuccess", {
              defaultValue: "Event created successfully",
            })
          )
          startTransition(() => {
            router.refresh()
          })
          onClose()
        } else {
          toast.error(
            res.error ||
              t("events.saveError", { defaultValue: "Failed to save event" })
          )
        }
      }
    } catch (error) {
      console.error("Failed to save event:", error)
      toast.error(
        t("events.saveError", { defaultValue: "Failed to save event" })
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="event-name">{t("events.dialog.nameLabel")}</Label>
          <Input
            id="event-name"
            placeholder={t("events.dialog.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-4 bg-white"
            required
            disabled={submitting}
          />
        </div>

        <div>
          <Label htmlFor="event-type">{t("events.dialog.typeLabel")}</Label>
          <Select value={type} onValueChange={setType} disabled={submitting}>
            <SelectTrigger id="event-type" className="mt-4 w-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="singles">
                {t("events.dialog.types.singles", { defaultValue: "Singles" })}
              </SelectItem>
              <SelectItem value="doubles">
                {t("events.dialog.types.doubles", { defaultValue: "Doubles" })}
              </SelectItem>
              <SelectItem value="team">
                {t("events.dialog.types.team", { defaultValue: "Team" })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="gender">{t("events.dialog.genderLabel")}</Label>
          <Select
            value={gender}
            onValueChange={setGender}
            disabled={submitting}
          >
            <SelectTrigger id="gender" className="mt-4 w-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="men">
                {t("events.dialog.genders.men", { defaultValue: "Men" })}
              </SelectItem>
              <SelectItem value="women">
                {t("events.dialog.genders.women", { defaultValue: "Women" })}
              </SelectItem>
              <SelectItem value="mixed">
                {t("events.dialog.genders.mixed", { defaultValue: "Mixed" })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="min-rating">{t("events.dialog.minRating")}</Label>
          <Input
            id="min-rating"
            type="number"
            step="0.1"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="mt-4 bg-white"
            disabled={submitting}
          />
        </div>

        <div>
          <Label htmlFor="max-rating">{t("events.dialog.maxRating")}</Label>
          <Input
            id="max-rating"
            type="number"
            step="0.1"
            value={maxRating}
            onChange={(e) => setMaxRating(e.target.value)}
            className="mt-4 bg-white"
            disabled={submitting}
          />
        </div>

        <div>
          <Label htmlFor="capacity">{t("events.dialog.capacity")}</Label>
          <Input
            id="capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="mt-4 bg-white"
            disabled={submitting}
          />
        </div>

        <div>
          <Label htmlFor="entry-fee">{t("events.dialog.entryFee")}</Label>
          <div className="relative mt-4">
            <Input
              id="entry-fee"
              type="text"
              value={entryFee}
              onChange={handleEntryFeeChange}
              className="bg-white pr-12"
              required
              disabled={submitting}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-sm font-medium text-gray-500">VND</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitting}
        >
          {t("events.dialog.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={submitting}
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingEvent
            ? t("events.dialog.saveChanges", { defaultValue: "Save Changes" })
            : t("events.dialog.submit", { defaultValue: "Save Event" })}
        </Button>
      </div>
    </form>
  )
}
