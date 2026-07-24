"use client"

import { Plus, Trash2 } from "lucide-react"
import type { ChangeEvent, FormEvent } from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useCreateTournamentStore } from "../../stores/create-tournament-store"
import type {
  TournamentEvent,
  TournamentEventGender,
  TournamentEventType,
} from "../../types/tournament-event"

interface EventCapacityProps {
  capacity: number
}

function EventCapacity({ capacity }: EventCapacityProps) {
  const { t } = useTournamentTranslation()
  return (
    <span>
      {t("create.step3.capacity", {
        capacity,
        defaultValue: `Capacity: ${capacity} Slots`,
      })}
    </span>
  )
}

interface EventDUPRProps {
  skillRange: string
}

function EventDUPR({ skillRange }: EventDUPRProps) {
  const { t } = useTournamentTranslation()
  return (
    <span>
      {t("create.step3.dupr", {
        skillRange,
        defaultValue: `DUPR: ${skillRange}`,
      })}
    </span>
  )
}

interface EventFeeProps {
  fee: number
}

function EventFee({ fee }: EventFeeProps) {
  const { t } = useTournamentTranslation()
  return (
    <span>
      {t("create.step3.fee", {
        fee: fee.toLocaleString("vi-VN"),
        defaultValue: `Fee: ${fee.toLocaleString("vi-VN")} VND`,
      })}
    </span>
  )
}

export function Step2Events() {
  const { t } = useTournamentTranslation()
  const events = useCreateTournamentStore((state) => state.events)
  const addEvent = useCreateTournamentStore((state) => state.addEvent)
  const deleteEvent = useCreateTournamentStore((state) => state.deleteEvent)
  const updateEvent = useCreateTournamentStore((state) => state.updateEvent)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState<number | string | null>(
    null
  )
  const [name, setName] = useState("")
  const [type, setType] = useState("singles")
  const [gender, setGender] = useState("men")
  const [minRating, setMinRating] = useState("")
  const [maxRating, setMaxRating] = useState("")
  const [capacity, setCapacity] = useState("")
  const [entryFee, setEntryFee] = useState("")

  const resetFormFields = () => {
    setEditingEventId(null)
    setName("")
    setType("singles")
    setGender("men")
    setMinRating("")
    setMaxRating("")
    setCapacity("")
    setEntryFee("")
  }

  const handleEntryFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "")
    if (!rawValue) {
      setEntryFee("")
      return
    }
    const formatted = Number(rawValue).toLocaleString("vi-VN")
    setEntryFee(formatted)
  }

  const handleEditClick = (event: TournamentEvent) => {
    setEditingEventId(event.id)
    setName(event.name)
    setType(event.type.toLowerCase())
    setGender(event.gender.toLowerCase())
    const [min, max] = event.skillRange.split("-")
    setMinRating(min || "3.0")
    setMaxRating(max || min || "4.5")
    setCapacity(String(event.capacity))
    setEntryFee(event.entryFee.toLocaleString("vi-VN"))
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const eventData = {
      name,
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

    if (editingEventId !== null) {
      updateEvent(editingEventId, eventData)
    } else {
      addEvent(eventData)
    }

    resetFormFields()
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <p className="text-sm text-gray-600">
            {t("create.step3.eventsDesc", {
              defaultValue:
                "Define the categories and competition contents for this tournament.",
            })}
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetFormFields()
          }}
        >
          <DialogTrigger asChild>
            <Button
              type="button"
              onClick={() => resetFormFields()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("events.createEvent", { defaultValue: "Add Event" })}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-150">
            <DialogHeader>
              <DialogTitle>
                {editingEventId !== null
                  ? t("events.dialog.editTitle", { defaultValue: "Edit Event" })
                  : t("events.dialog.title", { defaultValue: "Add New Event" })}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="event-name">
                  {t("events.dialog.nameLabel")}
                </Label>
                <Input
                  id="event-name"
                  placeholder={t("events.dialog.namePlaceholder", {
                    defaultValue: "e.g., Men's Doubles 4.0",
                  })}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 bg-white"
                  required
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-type">
                    {t("events.dialog.typeLabel")}
                  </Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger
                      id="event-type"
                      className="mt-4 w-full bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="singles">
                        {t("events.dialog.types.singles", {
                          defaultValue: "Singles",
                        })}
                      </SelectItem>
                      <SelectItem value="doubles">
                        {t("events.dialog.types.doubles", {
                          defaultValue: "Doubles",
                        })}
                      </SelectItem>
                      <SelectItem value="team">
                        {t("events.dialog.types.team", {
                          defaultValue: "Team",
                        })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gender">
                    {t("events.dialog.genderLabel")}
                  </Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender" className="mt-4 w-full bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">
                        {t("events.dialog.genders.men", {
                          defaultValue: "Men",
                        })}
                      </SelectItem>
                      <SelectItem value="women">
                        {t("events.dialog.genders.women", {
                          defaultValue: "Women",
                        })}
                      </SelectItem>
                      <SelectItem value="mixed">
                        {t("events.dialog.genders.mixed", {
                          defaultValue: "Mixed",
                        })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-rating">
                    {t("events.dialog.minRating")}
                  </Label>
                  <Input
                    id="min-rating"
                    type="number"
                    step="0.1"
                    placeholder={t("events.dialog.minRatingPlaceholder", {
                      defaultValue: "e.g. 3.0",
                    })}
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="mt-4 bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="max-rating">
                    {t("events.dialog.maxRating")}
                  </Label>
                  <Input
                    id="max-rating"
                    type="number"
                    step="0.1"
                    placeholder={t("events.dialog.maxRatingPlaceholder", {
                      defaultValue: "e.g. 4.5",
                    })}
                    value={maxRating}
                    onChange={(e) => setMaxRating(e.target.value)}
                    className="mt-4 bg-white"
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">
                    {t("events.dialog.capacity")}
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder={t("events.dialog.capacityPlaceholder", {
                      defaultValue: "e.g. 32",
                    })}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="mt-4 bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="entry-fee">
                    {t("events.dialog.entryFee")}
                  </Label>
                  <div className="relative mt-4">
                    <Input
                      id="entry-fee"
                      type="text"
                      placeholder={t("events.dialog.entryFeePlaceholder", {
                        defaultValue: "150.000",
                      })}
                      value={entryFee}
                      onChange={handleEntryFeeChange}
                      className="bg-white pr-12"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-sm font-medium text-gray-500">
                        VND
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetFormFields()
                  }}
                >
                  {t("events.dialog.cancel", { defaultValue: "Cancel" })}
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {editingEventId !== null
                    ? t("events.dialog.saveChanges", {
                        defaultValue: "Save Changes",
                      })
                    : t("events.dialog.submit", { defaultValue: "Save Event" })}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card
            key={event.id}
            onClick={() => handleEditClick(event)}
            className="cursor-pointer border border-gray-200 transition-all hover:border-emerald-400 hover:shadow-md"
          >
            <CardContent className="flex items-center justify-between px-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {event.name}
                  </h4>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-700 capitalize">
                    {t(`events.dialog.types.${event.type.toLowerCase()}`, {
                      defaultValue: event.type,
                    })}
                  </span>
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-sm font-medium text-blue-700 capitalize">
                    {t(`events.dialog.genders.${event.gender.toLowerCase()}`, {
                      defaultValue: event.gender,
                    })}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  <EventCapacity capacity={event.capacity} />
                  <span className="text-gray-300">•</span>
                  <EventDUPR skillRange={event.skillRange} />
                  <span className="text-gray-300">•</span>
                  <EventFee fee={event.entryFee} />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteEvent(event.id)
                }}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && (
          <div className="rounded-lg border border-dashed bg-gray-50/50 py-8 text-center text-sm text-gray-500">
            {t("create.step3.noEvents", {
              defaultValue:
                "No events added yet. Click 'Add Event' to set up the competition content.",
            })}
          </div>
        )}
      </div>
    </div>
  )
}
