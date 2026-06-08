"use client"

import { CalendarClock } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

export function BookingDateSelectionCard() {
  const { t } = useSportCenterTranslation()
  const selectedDate = useBookingStore((state) => state.selectedDate)
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarClock className="size-5" />
          {t("booking.dateSelection.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-lg border">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}
