"use client"

import { useEffect } from "react"

import { useCourtScheduleStore } from "../../stores/court-schedule-store"
import type { Booking } from "../../types/booking"
import type { SportCenter } from "../../types/sport-center"
import { BookingDetailModal } from "./booking-modal"
import { TimeSlot } from "./court-slot"
import { QuickBookingModal } from "./quick-booking-modal"

function generateTimeSlots(
  openTime: string,
  closeTime: string,
  intervalMinutes = 30
) {
  const [oh, om] = openTime.split(":").map(Number)
  const [ch, cm] = closeTime.split(":").map(Number)

  const start = new Date()
  start.setHours(oh, om, 0, 0)
  const end = new Date()
  end.setHours(ch, cm, 0, 0)

  const slots: string[] = []
  const cur = new Date(start)
  while (cur < end) {
    const hh = cur.getHours().toString().padStart(2, "0")
    const mm = cur.getMinutes().toString().padStart(2, "0")
    slots.push(`${hh}:${mm}`)
    cur.setMinutes(cur.getMinutes() + intervalMinutes)
  }
  return slots
}

export function CourtSchedule({
  ownerMode = false,
  center,
}: {
  ownerMode?: boolean
  center: SportCenter
}) {
  const {
    courts,
    bookings,
    selectedBooking,
    date,
    courtFilter,
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

  const selectedCenter = center
  const openTime = selectedCenter.openTime
  const closeTime = selectedCenter.closeTime

  const timeSlots = generateTimeSlots(openTime, closeTime, 30)

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
    <div className="w-full overflow-x-auto">
      <div
        className="grid gap-px bg-border"
        style={{
          gridTemplateColumns: `120px repeat(${timeSlots.length}, 140px)`,
        }}
      >
        {/* Header Row */}
        <div className="dark:bg-surface sticky left-0 z-0 bg-background p-4" />
        {timeSlots.map((time) => (
          <div
            key={time}
            className="dark:bg-surface bg-background p-4 text-center text-sm text-foreground"
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
                    onClick={() => handleSlotClick(court.id, court.name, time)}
                  />
                )
              })}
            </div>
          ))}
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
    </div>
  )
}
