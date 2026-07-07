"use client"

import { Calendar as CalendarIcon, Clock3, MapPin, Phone } from "lucide-react"
import { useMemo } from "react"

import { FallbackImage } from "@/components/fallback-image"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"
import { useSportCenterStore } from "@/features/sport-center/stores/sport-center-store"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

type BookingCourtInfoCardProps = {
  sportCenter: SportCenter | null
}

export function BookingCourtInfoCard({
  sportCenter,
}: BookingCourtInfoCardProps) {
  const { t } = useSportCenterTranslation()
  const storeCenter = useSportCenterStore((s) => s.sportCenter)
  const center = sportCenter ?? storeCenter ?? null

  const selectedDate = useBookingStore((state) => state.selectedDate)
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate)

  const selectedDateText = useMemo(() => {
    if (!selectedDate) return t("booking.summary.noDate")
    const day = String(selectedDate.getDate()).padStart(2, "0")
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
    const year = selectedDate.getFullYear()
    return `${day}/${month}/${year}`
  }, [selectedDate, t])

  const imageSrc =
    center?.images?.[0] ??
    "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=240&q=80"
  const centerName = center?.name || t("booking.courtInfo.noName")
  const centerAddress = center?.address || t("booking.courtInfo.noAddress")
  const centerPhone = center?.phone || t("booking.courtInfo.noPhone")

  const hasHours = Boolean(center?.openTime && center?.closeTime)
  const centerHours = hasHours
    ? t("detail.header.operatingHours", {
        openTime: center!.openTime,
        closeTime: center!.closeTime,
      })
    : t("booking.courtInfo.openDaily")

  return (
    <Card>
      <CardContent className="flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center">
        {/* Left Side: Court Image & Info Details */}
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <FallbackImage
            src={imageSrc}
            alt={`${centerName} overview`}
            className="h-24 w-full shrink-0 rounded-lg object-cover sm:w-40"
          />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{centerName}</h2>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {centerAddress}
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4" />
              {centerHours}
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4" />
              {centerPhone}
            </p>
          </div>
        </div>

        {/* Right Side: Calendar Selector (like tournament booking) */}
        <div className="flex shrink-0 items-center gap-2 border-t pt-4 select-none md:border-t-0 md:pt-0">
          <span className="text-xs font-bold text-gray-600 dark:text-zinc-400">
            {t("booking.dateSelection.title")}:
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{selectedDateText}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="border-gray-150 w-auto animate-in rounded-md border bg-white p-0 shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              align="end"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md bg-white dark:bg-zinc-950"
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  )
}
