import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SelectedCourts } from "@/features/booking/types"

type Props = {
  selectedDate: Date | undefined
  bookedSlots: Record<number, string[]>
  timeSlots: string[]
  selectedCourts: SelectedCourts
  onToggleCourtSlot: (courtId: number, slot: string) => void
}

export function BookingAvailableCourtsCard({
  selectedDate,
  bookedSlots,
  timeSlots,
  selectedCourts,
  onToggleCourtSlot,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Sân trống (
          {selectedDate
            ? `${Object.keys(bookedSlots).length} sân`
            : "Select date first"}
          )
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedDate ? (
          <p className="text-sm text-muted-foreground">
            Hãy chọn ngày để xem sân nào còn trống.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(bookedSlots).map(([courtIdStr, booked]) => {
              const courtId = Number(courtIdStr)
              const isSelected =
                selectedCourts[courtId] && selectedCourts[courtId].size > 0

              return (
                <div key={courtId} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">Sân {courtId}</h3>
                    {isSelected && (
                      <span className="text-xs font-semibold text-primary">
                        {selectedCourts[courtId].size} giờ đã chọn
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {timeSlots.map((slot) => {
                      const isBooked = booked.includes(slot)
                      const isSelectedSlot = selectedCourts[courtId]?.has(slot)

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() =>
                            !isBooked && onToggleCourtSlot(courtId, slot)
                          }
                          className={[
                            "rounded-md border px-2 py-2 text-xs transition-colors sm:text-sm",
                            isBooked
                              ? "cursor-not-allowed border-muted bg-muted text-muted-foreground opacity-50"
                              : isSelectedSlot
                                ? "border-primary bg-primary text-primary-foreground"
                                : "hover:bg-accent",
                          ].join(" ")}
                        >
                          {slot}
                          {isBooked && " ❌"}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
