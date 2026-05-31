"use client"

import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"

export function BookingAvailableCourtsCard() {
  const availability = useBookingStore((state) => state.courtAvailability)
  const isLoading = useBookingStore((state) => state.isLoadingAvailability)
  const error = useBookingStore((state) => state.availabilityError)
  const selectedCourts = useBookingStore((state) => state.selectedCourts)
  const onToggleCourtSlot = useBookingStore((state) => state.toggleCourtSlot)

  const courtCount = availability?.courtCount ?? 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Danh sách sân</CardTitle>
          <Badge variant="outline">{courtCount} sân</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Đang tải danh sách sân trống...
          </p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : !availability ? (
          <p className="text-sm text-muted-foreground">
            Hãy chọn ngày để xem sân nào còn trống.
          </p>
        ) : availability.courts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ngày này chưa có dữ liệu sân trống.
          </p>
        ) : (
          <div className="space-y-4">
            {availability.courts.map((court) => {
              const isSelected =
                selectedCourts[court.courtId] &&
                selectedCourts[court.courtId].size > 0
              const availableSlots = court.slots.filter(
                (slot) => slot.available
              )
              const bookedCount = court.slots.length - availableSlots.length

              return (
                <div key={court.courtId} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{court.courtName}</h3>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-semibold text-primary">
                        {selectedCourts[court.courtId].size} giờ đã chọn
                      </span>
                    )}
                  </div>

                  <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{availableSlots.length} khung giờ còn trống</span>
                    <span>{bookedCount} khung giờ đã kín</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {court.slots.map((slot) => {
                      const isBooked = !slot.available
                      const slotKey = `${slot.startTime} - ${slot.endTime}`
                      const isSelectedSlot =
                        selectedCourts[court.courtId]?.has(slotKey)

                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={isBooked}
                          onClick={() =>
                            !isBooked &&
                            onToggleCourtSlot(court.courtId, slotKey)
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
                          {slot.startTime} - {slot.endTime}
                          {isBooked && (
                            <X className="ml-1 inline size-5 text-destructive" />
                          )}
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
