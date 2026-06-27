"use client"

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

export default function BookingSummaryFooter() {
  const { t } = useTournamentTranslation()
  const selectedCourts = useBookingStore((s) => s.selectedCourts)
  const courtAvailability = useBookingStore((s) => s.courtAvailability)
  const setIsConfirmDialogOpen = useBookingStore(
    (s) => s.setIsConfirmDialogOpen
  )

  const selectedDateText = useSelectedDateText()
  const totalSlotsCount = useTotalSlotsCount()
  const totalPrice = useTotalPrice()

  return (
    <div className="sticky bottom-0 z-40 -mx-4 mt-auto border-t border-gray-200 bg-white/95 px-4 py-6 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xs sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
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
              className="w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
              align="center"
              side="top"
              sideOffset={8}
            >
              <h4 className="mb-2 border-b pb-1.5 text-sm font-bold text-gray-800">
                {t("booking.page.selectedSlotsHeader", {
                  defaultValue: "Selected Slots",
                })}
              </h4>
              <div className="max-h-40 space-y-2 overflow-y-auto pr-1 text-xs">
                {Object.entries(selectedCourts).map(
                  ([courtId, slots], index) => {
                    const courtName =
                      courtAvailability?.courts.find(
                        (c) => c.courtId === courtId
                      )?.courtName ||
                      `${t("booking.grid.courtHeader", { defaultValue: "Court" })} ${courtId}`
                    return (
                      <div
                        key={courtId}
                        className={`space-y-0.5 ${index !== 0 ? "border-t border-gray-100 pt-1.5" : ""}`}
                      >
                        <p className="font-semibold text-gray-700">
                          {courtName}:
                        </p>
                        <p className="font-medium text-gray-500">
                          {Array.from(slots).join(", ")}
                        </p>
                      </div>
                    )
                  }
                )}
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
            className="h-10 bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
            disabled={totalSlotsCount === 0}
            onClick={() => setIsConfirmDialogOpen(true)}
          >
            {t("booking.page.confirmBtn", { defaultValue: "Book Slots" })}
          </Button>
        </div>
      </div>
    </div>
  )
}
