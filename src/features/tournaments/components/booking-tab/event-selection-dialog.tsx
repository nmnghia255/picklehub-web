"use client"

import { CalendarDays } from "lucide-react"
import { useRef } from "react"

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

import { useBookingStore } from "../../stores/use-booking-store"
import type { TournamentEvent } from "../../types/tournament-event"

interface EventSelectionDialogProps {
  events: TournamentEvent[]
  onConfirm: (eventId: string | null) => void
}

export function EventSelectionDialog({
  events,
  onConfirm,
}: EventSelectionDialogProps) {
  const { t } = useTournamentTranslation()
  const isEventDialogOpen = useBookingStore((s) => s.isEventDialogOpen)
  const setIsEventDialogOpen = useBookingStore((s) => s.setIsEventDialogOpen)
  const selectedEventId = useBookingStore((s) => s.selectedEventId)
  const setSelectedEventId = useBookingStore((s) => s.setSelectedEventId)
  const eventSearchQuery = useBookingStore((s) => s.eventSearchQuery)
  const setEventSearchQuery = useBookingStore((s) => s.setEventSearchQuery)
  const isGeneralBooking = useBookingStore((s) => s.isGeneralBooking)
  const setIsGeneralBooking = useBookingStore((s) => s.setIsGeneralBooking)
  const setSelectedEvent = useBookingStore((s) => s.setSelectedEvent)
  const eventContainerRef = useRef<HTMLDivElement>(null)

  const filteredEvents = events.filter((ev) => {
    // Exclude events that have no group stage (totalMatches is null/undefined)
    if (ev.totalMatches == null) return false
    const q = eventSearchQuery.toLowerCase().trim()
    if (!q) return true
    return ev.name.toLowerCase().includes(q)
  })

  const selectedEventLabel =
    events.find((e) => String(e.id) === selectedEventId)?.name ?? ""

  const handleConfirm = () => {
    if (isGeneralBooking) {
      setSelectedEvent(null)
      onConfirm(null)
    } else {
      const selected =
        events.find((e) => String(e.id) === selectedEventId) || null
      setSelectedEvent(selected)
      onConfirm(selectedEventId || null)
    }
  }

  return (
    <Dialog
      open={isEventDialogOpen}
      onOpenChange={(open) => {
        setIsEventDialogOpen(open)
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
                        : events.every((ev) => ev.totalMatches == null)
                          ? t("booking.eventDialog.noGroupStage", {
                              defaultValue:
                                "No events have a group stage set up yet. Please create a group stage first.",
                            })
                          : t("booking.form.noMatchesFound")}
                    </ComboboxEmpty>
                  ) : (
                    filteredEvents.map((ev) => {
                      const isDouble =
                        ev.type?.toLowerCase() === "doubles" ||
                        ev.type?.toLowerCase() === "double"
                      const participantCount = ev.participants ?? 0
                      // Prefer server-provided totalMatches; fall back to estimate only if absent
                      const totalMatches =
                        ev.totalMatches ?? Math.max(0, participantCount - 1)
                      const isExact = ev.totalMatches !== undefined
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
                                {!isExact && "~"}
                                {totalMatches}{" "}
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
                const totalMatches =
                  ev?.totalMatches ?? Math.max(0, participantCount - 1)
                const isExact = ev?.totalMatches !== undefined
                return (
                  <span>
                    {t("booking.eventDialog.requirementHint", {
                      defaultValue: `You will need to book at least ${isExact ? "" : "~"}${totalMatches} court slot(s) to cover all matches in this event.`,
                      count: totalMatches,
                    })}
                  </span>
                )
              })()}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
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
