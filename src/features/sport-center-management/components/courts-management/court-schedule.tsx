"use client"

import { useEffect } from "react"

import {
  type Booking,
  useCourtScheduleStore,
} from "../../stores/court-schedule-store"
import { BookingDetailModal } from "./booking-modal"
import { TimeSlot } from "./court-slot"
import { Filters } from "./filters"
import { QuickBookingModal } from "./quick-booking-modal"

const timeSlots = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 6
  return `${hour.toString().padStart(2, "0")}:00`
})

export function CourtSchedule({ ownerMode = false }: { ownerMode?: boolean }) {
  const {
    courts,
    bookings,
    selectedBooking,
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
    fetchCourts,
    cancelBooking,
    createBooking,
    createBookingByOwner,
  } = useCourtScheduleStore()

  useEffect(() => {
    fetchCourts()
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const handleSlotClick = (
    courtId: string,
    courtName: string,
    time: string
  ) => {
    const booking = bookings[`${courtName}-${time}`]

    if (booking) {
      openBooking(booking)
    } else {
      openQuickBooking({ courtId, courtName, time })
    }
  }

  const handleRebookFromCancelled = (booking: Booking) => {
    rebookFromCancelled(booking)
  }

  const handleCancelBooking = async (bookingId: string) => {
    await cancelBooking(bookingId)
  }

  const handleCreateBooking = async (playerName: string, contact: string) => {
    if (ownerMode) {
      await createBookingByOwner(playerName, contact)
    } else {
      await createBooking(playerName, contact)
    }
  }

  return (
    <>
      <div className="mb-4">
        <Filters
          date={date}
          setDate={setDate}
          courtFilter={courtFilter}
          setCourtFilter={setCourtFilter}
          courts={courts}
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
            {courts
              .filter((c) =>
                courtFilter === "all" ? true : c.name === courtFilter
              )
              .map((court) => (
                <div key={court.name} className="contents">
                  <div className="dark:bg-surface sticky left-0 z-0 flex items-center bg-background p-4 text-foreground">
                    {court.name}
                  </div>
                  {timeSlots.map((time) => {
                    const bookingKey = `${court.name}-${time}`
                    const booking = bookings[bookingKey]
                    return (
                      <TimeSlot
                        key={`${court.name}-${time}`}
                        booking={booking}
                        onClick={() =>
                          handleSlotClick(court.id, court.name, time)
                        }
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
        onClose={closeQuickBooking}
        onCreate={handleCreateBooking}
      />
    </>
  )
}
