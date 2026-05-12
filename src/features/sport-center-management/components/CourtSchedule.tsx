import { useEffect } from "react"

import {
  type Booking,
  getCourtNames,
  useCourtScheduleStore,
} from "../stores/court-schedule-store"
import { BookingDetailModal } from "./BookingModal"
import { TimeSlot } from "./CourtSlot"
import { Filters } from "./Filters"
import { QuickBookingModal } from "./QuickBookingModal"

const timeSlots = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 6
  return `${hour.toString().padStart(2, "0")}:00`
})

export function CourtSchedule() {
  const {
    bookings,
    selectedBooking,
    quickBookingSlot,
    date,
    courtFilter,
    setDate,
    setCourtFilter,
    openBooking,
    closeBooking,
    closeQuickBooking,
    openQuickBooking,
    rebookFromCancelled,
    fetchBookings,
    cancelBooking,
    createBooking,
  } = useCourtScheduleStore()

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const handleSlotClick = (court: string, time: string) => {
    const booking = bookings[`${court}-${time}`]

    if (booking) {
      openBooking(booking)
    } else {
      openQuickBooking({ court, time })
    }
  }

  const handleRebookFromCancelled = (booking: Booking) => {
    rebookFromCancelled(booking)
  }

  const handleCancelBooking = async (bookingId: string) => {
    await cancelBooking(bookingId)
  }

  const handleCreateBooking = async (playerName: string, contact: string) => {
    await createBooking(playerName, contact)
  }

  return (
    <>
      <div className="mb-4">
        <Filters
          date={date}
          setDate={setDate}
          courtFilter={courtFilter}
          setCourtFilter={setCourtFilter}
        />
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-[120px_repeat(16,minmax(140px,1fr))] gap-px bg-border">
            {/* Header Row */}
            <div className="dark:bg-surface sticky left-0 z-0 bg-background p-4" />
            {timeSlots.map((time) => (
              <div
                key={time}
                className="dark:bg-surface bg-background p-4 text-center text-sm text-muted-foreground"
              >
                {time}
              </div>
            ))}

            {/* Court Rows */}
            {getCourtNames()
              .filter((c) => (courtFilter === "all" ? true : c === courtFilter))
              .map((court) => (
                <div key={court} className="contents">
                  <div className="dark:bg-surface sticky left-0 z-0 flex items-center bg-background p-4 text-foreground">
                    {court}
                  </div>
                  {timeSlots.map((time) => {
                    const bookingKey = `${court}-${time}`
                    const booking = bookings[bookingKey]
                    return (
                      <TimeSlot
                        key={`${court}-${time}`}
                        booking={booking}
                        onClick={() => handleSlotClick(court, time)}
                      />
                    )
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>

      <BookingDetailModal
        booking={selectedBooking}
        onClose={closeBooking}
        onCancel={handleCancelBooking}
        onBookNew={(booking) => handleRebookFromCancelled(booking)}
      />

      <QuickBookingModal
        slot={quickBookingSlot}
        onClose={closeQuickBooking}
        onCreate={handleCreateBooking}
      />
    </>
  )
}
