"use client"

import { AlertTriangle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  useBookingStore,
  useSelectedDateText,
  useTotalPrice,
  useTotalSlotsCount,
} from "../../stores/use-booking-store"

function formatDateLabel(dateKey: string): string {
  // dateKey is YYYY-MM-DD
  const parts = dateKey.split("-")
  if (parts.length !== 3) return dateKey
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

export default function BookingSummaryFooter() {
  const { t } = useTournamentTranslation()
  const selectedCourts = useBookingStore((s) => s.selectedCourts)
  const courtAvailability = useBookingStore((s) => s.courtAvailability)
  const selectedEvent = useBookingStore((s) => s.selectedEvent)
  const setIsConfirmDialogOpen = useBookingStore(
    (s) => s.setIsConfirmDialogOpen
  )

  const selectedDateText = useSelectedDateText(t)
  const totalSlotsCount = useTotalSlotsCount()
  const totalPrice = useTotalPrice()

  // Calculate total matches required from event participants
  const totalMatchesRequired = selectedEvent
    ? (selectedEvent.totalMatches ??
      Math.max(0, (selectedEvent.participants ?? 0) - 1))
    : 0

  const hasEnoughSlots =
    totalMatchesRequired === 0 || totalSlotsCount >= totalMatchesRequired

  // Compute per-date slot count for display
  const dateEntries = Object.entries(selectedCourts).map(
    ([dateKey, courts]) => {
      const slotCount = Object.values(courts).reduce(
        (sum, slots) => sum + slots.size,
        0
      )
      return { dateKey, courts, slotCount }
    }
  )

  return (
    <div className="sticky bottom-0 z-40 -mx-4 mt-auto border-t border-gray-200 bg-white/95 px-4 py-4 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xs sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
      {/* Match requirement banner */}
      {selectedEvent && (
        <div className="mx-auto mb-3 max-w-7xl">
          <div
            className={[
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium",
              hasEnoughSlots
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800",
            ].join(" ")}
          >
            {hasEnoughSlots ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            )}
            <span>
              {t("booking.page.eventContext", {
                name: selectedEvent.name,
                defaultValue: `Event: ${selectedEvent.name}`,
              })}{" "}
              —{" "}
              {t("booking.page.matchRequirement", {
                count: totalMatchesRequired,
                defaultValue: `Minimum ${totalMatchesRequired} court slot(s) required for all matches`,
              })}
              {!hasEnoughSlots && (
                <span className="ml-1 font-semibold">
                  (
                  {t("booking.page.slotsRemaining", {
                    count: totalMatchesRequired - totalSlotsCount,
                    defaultValue: `${totalMatchesRequired - totalSlotsCount} more needed`,
                  })}
                  )
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl flex-row items-center justify-between">
        {/* Left/Middle Side: Selected Slots Summary */}
        <div className="flex shrink-0 items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2">
          <div className="text-sm">
            <span className="font-semibold text-gray-700">
              {selectedDateText}
            </span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="font-bold text-emerald-600">
              {t("booking.page.slotsCount", {
                count: totalSlotsCount,
                defaultValue: `${totalSlotsCount} slots`,
              })}
            </span>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                disabled={totalSlotsCount === 0}
              >
                {t("booking.page.details", { defaultValue: "Details" })}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
              align="center"
              side="top"
              sideOffset={8}
            >
              <h4 className="mb-2 border-b pb-1.5 text-sm font-bold text-gray-800">
                {t("booking.page.selectedSlotsHeader", {
                  defaultValue: "Selected Slots",
                })}
              </h4>
              <div className="max-h-56 space-y-3 overflow-y-auto pr-1 text-xs">
                {dateEntries.map(({ dateKey, courts }) => (
                  <div key={dateKey}>
                    <p className="mb-1 text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                      {formatDateLabel(dateKey)}
                    </p>
                    <div className="space-y-1.5 pl-1">
                      {Object.entries(courts).map(([courtId, slots], index) => {
                        const courtName =
                          courtAvailability?.courts.find(
                            (c) => c.courtId === courtId
                          )?.courtName ||
                          `${t("booking.grid.courtHeader", { defaultValue: "Court" })} ${courtId}`
                        return (
                          <div
                            key={courtId}
                            className={`space-y-0.5 ${index !== 0 ? "border-t border-gray-100 pt-1" : ""}`}
                          >
                            <p className="font-semibold text-gray-700">
                              {courtName}:
                            </p>
                            <p className="font-medium text-gray-500">
                              {Array.from(slots).join(", ")}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right Side: Total Price & CTA Button */}
        <div className="flex shrink-0 items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">
              {t("booking.page.totalPrice", { defaultValue: "Total Price" })}
            </p>
            <p className="text-base font-extrabold text-emerald-700">
              {totalPrice.toLocaleString()} VND
            </p>
          </div>

          <Button
            className="h-10 bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            disabled={totalSlotsCount === 0 || !hasEnoughSlots}
            onClick={() => setIsConfirmDialogOpen(true)}
            title={
              !hasEnoughSlots
                ? t("booking.page.notEnoughSlotsTooltip", {
                    defaultValue: `Select at least ${totalMatchesRequired} slots to book`,
                  })
                : undefined
            }
          >
            {t("booking.page.confirmBtn", { defaultValue: "Book Slots" })}
          </Button>
        </div>
      </div>
    </div>
  )
}
