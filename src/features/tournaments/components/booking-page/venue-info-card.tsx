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

function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return ""

  if (dateInput instanceof Date) {
    const day = String(dateInput.getDate()).padStart(2, "0")
    const month = String(dateInput.getMonth() + 1).padStart(2, "0")
    const year = dateInput.getFullYear()
    return `${day}/${month}/${year}`
  }

  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split("-")
      return `${day}/${month}/${year}`
    }

    if (/^\d{4}-\d{2}-\d{2}T/.test(dateInput)) {
      const datePart = dateInput.split("T")[0]
      const [year, month, day] = datePart.split("-")
      return `${day}/${month}/${year}`
    }

    const parsedDate = new Date(dateInput)
    if (!isNaN(parsedDate.getTime())) {
      const day = String(parsedDate.getDate()).padStart(2, "0")
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0")
      const year = parsedDate.getFullYear()
      return `${day}/${month}/${year}`
    }
  } catch (e) {
    console.error("Error parsing date:", e)
  }

  return String(dateInput)
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
  const tournamentStartDate = useBookingStore((s) => s.tournamentStartDate)
  const tournamentEndDate = useBookingStore((s) => s.tournamentEndDate)

  if (!sportCenter) return null

  const activeDateKey = activeDate ? formatDateKey(activeDate) : undefined

  // Parse tournament date bounds for the calendar picker
  const calendarFromDate = (() => {
    if (!tournamentStartDate) return undefined
    if (/^\d{4}-\d{2}-\d{2}$/.test(tournamentStartDate)) {
      return new Date(tournamentStartDate + "T00:00:00")
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(tournamentStartDate)) {
      const datePart = tournamentStartDate.split("T")[0]
      return new Date(datePart + "T00:00:00")
    }
    const d = new Date(tournamentStartDate)
    return isNaN(d.getTime()) ? undefined : d
  })()

  const calendarToDate = (() => {
    if (!tournamentEndDate) return undefined
    if (/^\d{4}-\d{2}-\d{2}$/.test(tournamentEndDate)) {
      return new Date(tournamentEndDate + "T23:59:59")
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(tournamentEndDate)) {
      const datePart = tournamentEndDate.split("T")[0]
      return new Date(datePart + "T23:59:59")
    }
    const d = new Date(tournamentEndDate)
    return isNaN(d.getTime()) ? undefined : d
  })()

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

            {/* Multi-date picker wrapper */}
            <div className="flex flex-col items-start gap-1.5 select-none sm:items-end">
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-bold text-gray-600">
                  {t("booking.page.bookingDate")}:
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                      <span>{t("booking.page.selectDates")}</span>
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
                      disabled={[
                        calendarFromDate
                          ? { before: calendarFromDate }
                          : undefined,
                        calendarToDate ? { after: calendarToDate } : undefined,
                      ].filter(
                        (x): x is { before: Date } | { after: Date } => !!x
                      )}
                      onSelect={(dates) => {
                        // react-day-picker multiple mode gives us a new array;
                        // we diff it to figure out which date was toggled
                        if (!dates) return

                        // Filter out any date that is out of range
                        const validDates = dates.filter((date) => {
                          const d = new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate()
                          )
                          if (calendarFromDate) {
                            const start = new Date(
                              calendarFromDate.getFullYear(),
                              calendarFromDate.getMonth(),
                              calendarFromDate.getDate()
                            )
                            if (d < start) return false
                          }
                          if (calendarToDate) {
                            const end = new Date(
                              calendarToDate.getFullYear(),
                              calendarToDate.getMonth(),
                              calendarToDate.getDate()
                            )
                            if (d > end) return false
                          }
                          return true
                        })

                        const prevKeys = new Set(
                          selectedDates.map((d) => formatDateKey(d))
                        )
                        const nextKeys = new Set(
                          validDates.map((d) => formatDateKey(d))
                        )

                        // Find added dates
                        validDates.forEach((d) => {
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

              {tournamentStartDate && tournamentEndDate && (
                <span className="text-[11px] font-medium text-gray-500">
                  {t("booking.page.tournamentDates", {
                    start: formatDate(tournamentStartDate),
                    end: formatDate(tournamentEndDate),
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Date tabs row */}
          {selectedDates.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">
                {t("booking.page.selectedDate")}
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
                        title={t("booking.page.removeDate")}
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
