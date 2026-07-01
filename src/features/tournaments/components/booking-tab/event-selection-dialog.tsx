"use client"

import { CalendarDays } from "lucide-react"
import { useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentEvent } from "../../types/tournament-event"

interface EventSelectionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  events: TournamentEvent[]
  onConfirm: (eventId: string | null) => void
}

export function EventSelectionDialog({
  isOpen,
  onOpenChange,
  events,
  onConfirm,
}: EventSelectionDialogProps) {
  const { t } = useTournamentTranslation()
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [eventSearchQuery, setEventSearchQuery] = useState("")
  const [isGeneralBooking, setIsGeneralBooking] = useState(false)
  const eventContainerRef = useRef<HTMLDivElement>(null)

  const filteredEvents = events.filter((ev) => {
    const q = eventSearchQuery.toLowerCase().trim()
    if (!q) return true
    return ev.name.toLowerCase().includes(q)
  })

  const selectedEventLabel =
    events.find((e) => String(e.id) === selectedEventId)?.name ?? ""

  const handleConfirm = () => {
    if (isGeneralBooking) {
      onConfirm(null)
    } else {
      onConfirm(selectedEventId || null)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          setSelectedEventId("")
          setEventSearchQuery("")
          setIsGeneralBooking(false)
        }
      }}
    >
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
            {t("booking.eventDialog.title", {
              defaultValue: "Select Event to Book Courts For",
            })}
          </DialogTitle>
          <DialogDescription>
            {t("booking.eventDialog.description", {
              defaultValue:
                "Choose the tournament event you are booking courts for. The booking page will show the minimum courts required based on the event participants.",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2" ref={eventContainerRef}>
          <div className="space-y-2">
            <Label className="mb-3">
              {t("booking.eventDialog.eventLabel", {
                defaultValue: "Tournament Event",
              })}
            </Label>
            <Combobox
              disabled={isGeneralBooking}
              value={selectedEventLabel}
              onValueChange={(val) => {
                const found = events.find((e) => e.name === val)
                setSelectedEventId(found ? String(found.id) : "")
              }}
              inputValue={eventSearchQuery}
              onInputValueChange={(val) => {
                setEventSearchQuery(val || "")
              }}
            >
              <ComboboxInput
                disabled={isGeneralBooking}
                placeholder={t("booking.eventDialog.selectPlaceholder", {
                  defaultValue: "Search and select an event...",
                })}
                className="mt-1.5 w-full bg-white"
                showClear
              />
              <ComboboxContent container={eventContainerRef}>
                <ComboboxList>
                  {filteredEvents.length === 0 ? (
                    <ComboboxEmpty className="p-4 text-center text-xs text-gray-500">
                      {events.length === 0
                        ? t("booking.eventDialog.noEvents", {
                            defaultValue:
                              "No events found for this tournament.",
                          })
                        : t("booking.form.noMatchesFound")}
                    </ComboboxEmpty>
                  ) : (
                    filteredEvents.map((ev) => {
                      const isDouble =
                        ev.type?.toLowerCase() === "doubles" ||
                        ev.type?.toLowerCase() === "double"
                      const participantCount = ev.participants ?? 0
                      const totalMatches = Math.max(0, participantCount - 1)
                      return (
                        <ComboboxItem key={ev.id} value={ev.name}>
                          <div className="flex w-full flex-col gap-0.5 py-0.5 text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-gray-900">
                                {ev.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="px-1.5 py-0 text-[9px] font-bold"
                              >
                                {ev.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>
                                {isDouble
                                  ? `${participantCount} teams`
                                  : `${participantCount} players`}
                              </span>
                              <span className="font-medium text-emerald-600">
                                ~{totalMatches}{" "}
                                {t("booking.eventDialog.matchesLabel", {
                                  defaultValue: "matches",
                                })}
                              </span>
                            </div>
                          </div>
                        </ComboboxItem>
                      )
                    })
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {/* General Booking Checkbox */}
          <div className="flex items-center space-x-2 pt-1.5">
            <Checkbox
              id="general-booking"
              checked={isGeneralBooking}
              onCheckedChange={(checked) => {
                setIsGeneralBooking(!!checked)
                if (checked) {
                  setSelectedEventId("")
                }
              }}
            />
            <Label
              htmlFor="general-booking"
              className="cursor-pointer text-xs font-semibold text-gray-700 select-none"
            >
              {t("booking.eventDialog.generalBookingLabel", {
                defaultValue:
                  "Book without linking to a specific event (General / Additional booking)",
              })}
            </Label>
          </div>

          {!isGeneralBooking && selectedEventId && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-800">
              {(() => {
                const ev = events.find((e) => String(e.id) === selectedEventId)
                const participantCount = ev?.participants ?? 0
                const totalMatches = Math.max(0, participantCount - 1)
                return (
                  <span>
                    {t("booking.eventDialog.requirementHint", {
                      defaultValue: `You will need to book at least ${totalMatches} court slot(s) to cover all matches in this event.`,
                      count: totalMatches,
                    })}
                  </span>
                )
              })()}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("booking.cancelBtn")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isGeneralBooking && !selectedEventId}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {t("booking.eventDialog.confirmBtn", {
              defaultValue: "Continue to Booking",
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
