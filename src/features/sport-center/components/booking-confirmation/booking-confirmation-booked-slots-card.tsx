import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

type CourtRow = {
  courtId: string
  courtName: string
  slots: string[]
}

type BookingConfirmationBookedSlotsCardProps = {
  totalSlots: number
  selectedCourtCount: number
  courtRows: CourtRow[]
}

export function BookingConfirmationBookedSlotsCard({
  totalSlots,
  selectedCourtCount,
  courtRows,
}: BookingConfirmationBookedSlotsCardProps) {
  const { t } = useSportCenterTranslation()
  return (
    <Card className="border shadow-lg shadow-black/5">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            {t("booking.confirmation.scheduleTitle")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <p className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              {t("booking.confirmation.slotsCount", { count: totalSlots })}
            </p>
            <p className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              {t("detail.header.courtsCount", { count: selectedCourtCount })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {courtRows.map((row) => (
          <div key={row.courtId} className="rounded-xl border bg-muted/30 p-3">
            <p className="font-semibold">{row.courtName}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {row.slots.join(", ")}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
