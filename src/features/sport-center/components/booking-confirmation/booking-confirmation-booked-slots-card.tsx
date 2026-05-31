import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  return (
    <Card className="border shadow-lg shadow-black/5">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            Lịch đặt
          </CardTitle>
          <div className="flex items-center gap-2">
            <p className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              {totalSlots} khung giờ
            </p>
            <p className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              {selectedCourtCount} sân
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
