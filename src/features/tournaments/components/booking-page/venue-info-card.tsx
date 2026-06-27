"use client"

import { Building, Calendar as CalendarIcon } from "lucide-react"

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
  useBookingStore,
  useSelectedDateText,
} from "../../stores/use-booking-store"

export default function VenueInfoCard() {
  const { t } = useTournamentTranslation()
  const sportCenter = useBookingStore((s) => s.sportCenter)
  const selectedDate = useBookingStore((s) => s.selectedDate)
  const setSelectedDate = useBookingStore((s) => s.setSelectedDate)
  const selectedDateText = useSelectedDateText()

  if (!sportCenter) return null

  return (
    <section className="w-full">
      <Card className="border-gray-200 bg-white shadow-xs">
        <CardContent className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center">
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

          {/* Popover Calendar selector */}
          <div className="flex shrink-0 items-center gap-2 select-none">
            <span className="text-xs font-bold text-gray-600">
              {t("booking.page.bookingDate", { defaultValue: "Booking Date" })}:
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                  <span>{selectedDateText}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="border-gray-150 w-auto rounded-md border bg-white p-0 shadow-md"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md bg-white"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
