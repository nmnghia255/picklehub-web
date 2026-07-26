import { CalendarClock } from "lucide-react"

import { BackButton } from "@/components/common/back-button"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

interface BookingHistoryPageHeaderProps {
  totalBookings: number
}

export function BookingHistoryPageHeader({
  totalBookings,
}: BookingHistoryPageHeaderProps) {
  const { t } = useSportCenterTranslation()

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("booking.history.pageTitle")}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t("booking.history.pageDesc")}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3.5 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur">
            <CalendarClock className="size-4 text-emerald-500" />
            {t("booking.history.totalBookings", { count: totalBookings })}
          </div>
          <BackButton />
        </div>
      </div>
    </section>
  )
}
