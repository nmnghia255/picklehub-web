"use client"

import { Check, Loader2, Lock, X } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  useActiveDateSelectedCourts,
  useBookingStore,
  useUniqueSlotKeys,
} from "../../stores/use-booking-store"

export default function CourtTimelineGrid() {
  const { t } = useTournamentTranslation()
  const isLoadingAvailability = useBookingStore((s) => s.isLoadingAvailability)
  const availabilityError = useBookingStore((s) => s.availabilityError)
  const courtAvailability = useBookingStore((s) => s.courtAvailability)
  const activeDateSelectedCourts = useActiveDateSelectedCourts()
  const toggleSlot = useBookingStore((s) => s.toggleSlot)
  const uniqueSlotKeys = useUniqueSlotKeys()

  return (
    <section className="w-full grow">
      <Card className="gap-0 border-gray-200 bg-white pb-0 shadow-xs">
        <CardHeader className="flex flex-col justify-between gap-4 space-y-0 border-b pb-3 md:flex-row md:items-center">
          <div>
            <CardTitle className="text-md font-bold text-gray-800">
              {t("booking.grid.title")}
            </CardTitle>
            <CardDescription className="mt-0.5 text-sm">
              {t("booking.grid.description")}
            </CardDescription>
          </div>

          {/* Clean Legend matching App Theme */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold text-gray-600 select-none sm:text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded border border-gray-300 bg-white" />
              <span>{t("booking.grid.legendEmpty")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded border border-rose-200 bg-rose-50" />
              <span>{t("booking.grid.legendBooked")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded border border-gray-200 bg-gray-100" />
              <span>{t("booking.grid.legendLocked")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded border border-emerald-600 bg-emerald-500" />
              <span>{t("booking.grid.legendSelected")}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoadingAvailability ? (
            <div className="flex flex-col items-center justify-center gap-2 bg-gray-50/10 py-16">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
              <p className="text-xs font-medium text-gray-500">
                {t("booking.grid.loading")}
              </p>
            </div>
          ) : availabilityError ? (
            <div className="py-16 text-center text-xs font-semibold text-rose-600">
              {availabilityError}
            </div>
          ) : !courtAvailability || courtAvailability.courts.length === 0 ? (
            <div className="py-16 text-center text-xs font-medium text-gray-400">
              {t("booking.grid.noData")}
            </div>
          ) : (
            <div className="flex overflow-hidden">
              {/* STICKY LEFT COLUMN - Court Names */}
              <div className="z-10 flex w-32 shrink-0 flex-col border-r border-gray-200 bg-gray-50/80 sm:w-44">
                <div className="flex h-12 items-center justify-center border-b border-gray-200 bg-gray-100 text-xs font-bold text-gray-500 select-none sm:text-sm">
                  {t("booking.grid.courtHeader")}
                </div>
                {courtAvailability.courts.map((court) => (
                  <div
                    key={court.courtId}
                    className="flex h-16 items-center overflow-hidden border-b border-gray-200 bg-gray-50/90 px-2 text-xs font-bold whitespace-nowrap text-gray-700 select-none sm:px-4 sm:text-sm"
                  >
                    <span className="truncate" title={court.courtName}>
                      {court.courtName}
                    </span>
                  </div>
                ))}
              </div>

              {/* HORIZONTALLY SCROLLABLE TIMELINE GRID */}
              <div className="flex-1 scrollbar-thin overflow-x-auto select-none">
                {/* Time Headers Row */}
                <div className="flex h-12 min-w-max border-b border-gray-200 bg-gray-50">
                  {uniqueSlotKeys.map((slotKey) => {
                    const startTime = slotKey.split(" - ")[0]
                    return (
                      <div
                        key={slotKey}
                        className="border-gray-150 flex w-20 items-center justify-center border-r text-xs font-bold text-gray-500 sm:w-24"
                      >
                        {startTime}
                      </div>
                    )
                  })}
                </div>

                {/* Timeline Grid Cells */}
                <div className="min-w-max">
                  {courtAvailability.courts.map((court) => {
                    const isCompletelyUnavailable = court.slots.every(
                      (s) => !s.available
                    )

                    return (
                      <div
                        key={court.courtId}
                        className="flex h-16 border-b border-gray-200 bg-white"
                      >
                        {uniqueSlotKeys.map((slotKey) => {
                          const [startTime, endTime] = slotKey.split(" - ")
                          const slot = court.slots.find(
                            (s) =>
                              s.startTime === startTime && s.endTime === endTime
                          )

                          const isBooked = !slot || !slot.available
                          const isSelected =
                            activeDateSelectedCourts[court.courtId]?.has(
                              slotKey
                            )

                          // Determine color themes matching standard UI
                          let cellClass =
                            "bg-white hover:bg-emerald-50/10 text-transparent border-r border-gray-100"
                          if (isSelected) {
                            cellClass =
                              "bg-emerald-500 border border-emerald-600 text-white"
                          } else if (isBooked) {
                            cellClass = isCompletelyUnavailable
                              ? "bg-gray-100 border-r border-gray-200 cursor-not-allowed opacity-80"
                              : "bg-rose-50/60 border-r border-rose-100/80 cursor-not-allowed"
                          }

                          return (
                            <button
                              key={slotKey}
                              type="button"
                              disabled={isBooked}
                              onClick={() => toggleSlot(court.courtId, slotKey)}
                              className={[
                                "flex w-20 items-center justify-center transition-all sm:w-24",
                                cellClass,
                              ].join(" ")}
                              title={`${court.courtName}: ${slotKey}`}
                            >
                              {isSelected && (
                                <Check className="h-5.5 w-5.5 text-white" />
                              )}
                              {isBooked &&
                                (isCompletelyUnavailable ? (
                                  <Lock className="h-4 w-4 text-gray-400 opacity-40" />
                                ) : (
                                  <X className="h-4 w-4 text-rose-400 opacity-40" />
                                ))}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
