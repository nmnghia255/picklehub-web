import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

export type SlotItemInfo = {
  slotKey: string
  price?: number
}

export type CourtRow = {
  courtId: string
  courtName: string
  slots: (string | SlotItemInfo)[]
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

      <CardContent className="space-y-4 p-4">
        {courtRows.map((row) => (
          <div
            key={row.courtId}
            className="space-y-3 rounded-xl border bg-muted/30 p-4"
          >
            <p className="text-base font-semibold text-foreground">
              {row.courtName}
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {row.slots.map((item, idx) => {
                if (typeof item === "string") {
                  return (
                    <div
                      key={item || idx}
                      className="rounded-lg border bg-background/60 px-3 py-2 text-sm text-muted-foreground"
                    >
                      {item}
                    </div>
                  )
                }

                return (
                  <div
                    key={item.slotKey || idx}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-background/60 px-3.5 py-2 text-sm shadow-2xs"
                  >
                    <span className="text-muted-foreground">
                      {item.slotKey}
                    </span>
                    <span className="font-semibold text-foreground">
                      {item.price !== undefined
                        ? formatCurrencyVnd(item.price)
                        : "—"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
