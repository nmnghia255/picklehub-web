"use client"

import { Building, Calendar as CalendarIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import {
  useActiveDateText,
  useBookingStore,
} from "../../stores/use-booking-store"

function formatDateTabLabel(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${day}/${month}`
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function VenueInfoCard() {
  const { t } = useTournamentTranslation()
  const sportCenter = useBookingStore((s) => s.sportCenter)
  const selectedDates = useBookingStore((s) => s.selectedDates)
  const activeDate = useBookingStore((s) => s.activeDate)
  const selectedCourts = useBookingStore((s) => s.selectedCourts)
  const toggleSelectedDate = useBookingStore((s) => s.toggleSelectedDate)
  const setActiveDate = useBookingStore((s) => s.setActiveDate)
  const activeDateText = useActiveDateText()

  if (!sportCenter) return null

  const activeDateKey = activeDate ? formatDateKey(activeDate) : undefined

  return (
    <section className="w-full">
      <Card className="border-gray-200 bg-white shadow-xs">
        <CardContent className="flex flex-col gap-4 p-6">
          {/* Top row: venue info + date picker */}
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 sm:text-base">
                  {sportCenter.name}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  {sportCenter.address}
                </p>
              </div>
            </div>

            {/* Multi-date picker */}
            <div className="flex shrink-0 items-center gap-2 select-none">
              <span className="text-xs font-bold text-gray-600">
                {t("booking.page.bookingDate", { defaultValue: "Add Date" })}:
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {t("booking.page.selectDates", {
                        defaultValue: "Select Dates",
                      })}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="border-gray-150 w-auto rounded-md border bg-white p-0 shadow-md"
                  align="start"
                >
                  <Calendar
                    mode="multiple"
                    selected={selectedDates.filter((date) => {
                      const key = formatDateKey(date)
                      const isActive = key === activeDateKey
                      const hasBookings =
                        selectedCourts[key] &&
                        Object.values(selectedCourts[key]).some(
                          (slots) => slots.size > 0
                        )
                      return isActive || hasBookings
                    })}
                    onSelect={(dates) => {
                      // react-day-picker multiple mode gives us a new array;
                      // we diff it to figure out which date was toggled
                      if (!dates) return
                      const prevKeys = new Set(
                        selectedDates.map((d) => formatDateKey(d))
                      )
                      const nextKeys = new Set(
                        dates.map((d) => formatDateKey(d))
                      )

                      // Find added dates
                      dates.forEach((d) => {
                        if (!prevKeys.has(formatDateKey(d))) {
                          toggleSelectedDate(d)
                        }
                      })
                      // Find removed dates
                      selectedDates.forEach((d) => {
                        if (!nextKeys.has(formatDateKey(d))) {
                          toggleSelectedDate(d)
                        }
                      })
                    }}
                    className="rounded-md bg-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Date tabs row */}
          {selectedDates.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">
                {t("booking.page.selectedDate", { defaultValue: "Viewing:" })}
              </span>
              {selectedDates
                .slice()
                .sort((a, b) => a.getTime() - b.getTime())
                .filter((date) => {
                  const key = formatDateKey(date)
                  const isActive = key === activeDateKey
                  const hasBookings =
                    selectedCourts[key] &&
                    Object.values(selectedCourts[key]).some(
                      (slots) => slots.size > 0
                    )
                  return isActive || hasBookings
                })
                .map((date) => {
                  const key = formatDateKey(date)
                  const isActive = key === activeDateKey
                  return (
                    <div key={key} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isActive) setActiveDate(date)
                        }}
                        className={[
                          "flex items-center gap-1.5 rounded-l-md border px-3 py-1 text-xs font-semibold transition-all",
                          isActive
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                        ].join(" ")}
                      >
                        <CalendarIcon className="h-3 w-3" />
                        {formatDateTabLabel(date)}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSelectedDate(date)}
                        title={t("booking.page.removeDate", {
                          defaultValue: "Remove date",
                        })}
                        className={[
                          "flex items-center rounded-r-md border border-l-0 px-1.5 py-1 transition-all",
                          isActive
                            ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                            : "border-gray-200 bg-white text-gray-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500",
                        ].join(" ")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}

              {activeDateKey && (
                <span className="ml-1 text-xs text-gray-400">
                  — {activeDateText}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
