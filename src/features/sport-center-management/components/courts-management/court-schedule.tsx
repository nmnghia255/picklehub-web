"use client"

import { useEffect, useState } from "react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { useCourtScheduleStore } from "../../stores/court-schedule-store"
import type { Booking } from "../../types/booking"
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

export function CourtSchedule() {
  const { t } = useSportCenterManagementTranslation()
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
    createBookingByOwner,
  } = useCourtScheduleStore()

  const selectedCenter = useCourtScheduleStore((state) => state.selectedCenter)

  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedEmptySlots, setSelectedEmptySlots] = useState<
    { courtId: string; courtName: string; time: string }[]
  >([])

  useEffect(() => {
    if (!selectedCenter) return

    fetchCourts()
    fetchBookings()
  }, [date, fetchBookings, fetchCourts, selectedCenter])

  if (!selectedCenter) {
    return (
      <div className="rounded-md border border-border bg-background p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t("courts.noCenterSelected")}
        </p>
      </div>
    )
  }

  const openTime = selectedCenter.openTime
  const closeTime = selectedCenter.closeTime

  const timeSlots = generateTimeSlots(openTime, closeTime, 30)

  const handleSlotClick = (
    courtId: string,
    courtName: string,
    time: string
  ) => {
    const booking = bookings[`${courtName}-${time}`]

    if (booking) {
      openBooking(booking, { courtId, courtName, time })
    }
  }

  const handleSlotMouseDown = (
    courtId: string,
    courtName: string,
    time: string,
    e: React.MouseEvent
  ) => {
    if (e.button !== 0) return
    const booking = bookings[`${courtName}-${time}`]
    if (booking) return

    setIsSelecting(true)
    setSelectedEmptySlots([{ courtId, courtName, time }])
  }

  const handleSlotMouseEnter = (
    courtId: string,
    courtName: string,
    time: string
  ) => {
    if (!isSelecting) return

    const booking = bookings[`${courtName}-${time}`]
    if (booking) return

    setSelectedEmptySlots((prev) => {
      const alreadySelected = prev.some(
        (s) => s.courtName === courtName && s.time === time
      )
      if (alreadySelected) return prev
      return [...prev, { courtId, courtName, time }]
    })
  }

  const handleGlobalMouseUp = () => {
    if (!isSelecting) return
    setIsSelecting(false)

    if (selectedEmptySlots.length > 0) {
      openQuickBooking(selectedEmptySlots)
    }

    setSelectedEmptySlots([])
  }

  const handleRebookFromCancelled = (booking: Booking) => {
    rebookFromCancelled(booking)
  }

  const handleCancelBooking = async (bookingId: string) => {
    await cancelBooking(bookingId)
  }

  const handleCreateBooking = async (
    playerName: string,
    contact: string,
    note: string
  ) => {
    await createBookingByOwner(playerName, contact, note)
    await fetchBookings()
  }

  const isSlotSelected = (courtName: string, time: string) => {
    return selectedEmptySlots.some(
      (s) => s.courtName === courtName && s.time === time
    )
  }

  return (
    <div
      className="w-full overflow-x-auto select-none"
      onMouseUp={handleGlobalMouseUp}
    >
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
                    isSelected={isSlotSelected(court.name, time)}
                    onClick={() => handleSlotClick(court.id, court.name, time)}
                    onMouseDown={(e) =>
                      handleSlotMouseDown(court.id, court.name, time, e)
                    }
                    onMouseEnter={() =>
                      handleSlotMouseEnter(court.id, court.name, time)
                    }
                    onMouseUp={handleGlobalMouseUp}
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
