import { useState } from "react"

import { BookingDetailModal } from "./BookingModal"
import { TimeSlot } from "./CourtSlot"
import { Filters } from "./Filters"
import { QuickBookingModal } from "./QuickBookingModal"

export type BookingStatus = "available" | "booked" | "pending" | "cancelled"

export interface Booking {
  id: string
  playerName: string
  contact: string
  status: BookingStatus
  time: string
  court: string
}

const courts = ["Sân 1", "Sân 2", "Sân 3", "Sân 4"]
const timeSlots = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 6
  return `${hour.toString().padStart(2, "0")}:00`
})

// Mock booking data
const mockBookings: Record<string, Booking> = {
  "Sân 1-08:00": {
    id: "1",
    playerName: "Sarah Johnson",
    contact: "(555) 123-4567",
    status: "booked",
    time: "08:00",
    court: "Sân 1",
  },
  "Sân 1-10:00": {
    id: "2",
    playerName: "Mike Peters",
    contact: "(555) 234-5678",
    status: "pending",
    time: "10:00",
    court: "Sân 1",
  },
  "Sân 2-09:00": {
    id: "3",
    playerName: "Emily Davis",
    contact: "(555) 345-6789",
    status: "booked",
    time: "09:00",
    court: "Sân 2",
  },
  "Sân 3-14:00": {
    id: "4",
    playerName: "Robert Chen",
    contact: "(555) 456-7890",
    status: "booked",
    time: "14:00",
    court: "Sân 3",
  },
  "Sân 2-16:00": {
    id: "5",
    playerName: "Lisa Anderson",
    contact: "(555) 567-8901",
    status: "cancelled",
    time: "16:00",
    court: "Sân 2",
  },
}

export function CourtSchedule() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [quickBookingSlot, setQuickBookingSlot] = useState<{
    court: string
    time: string
  } | null>(null)
  const [bookings, setBookings] = useState(mockBookings)
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  )
  const [courtFilter, setCourtFilter] = useState<string>("all")

  const handleSlotClick = (court: string, time: string) => {
    const bookingKey = `${court}-${time}`
    const booking = bookings[bookingKey]

    if (booking) {
      setSelectedBooking(booking)
    } else {
      setQuickBookingSlot({ court, time })
    }
  }

  const handleRebookFromCancelled = (booking: Booking) => {
    setSelectedBooking(null)
    setQuickBookingSlot({ court: booking.court, time: booking.time })
  }

  const handleCancelBooking = (bookingId: string) => {
    const updatedBookings = { ...bookings }
    const entry = Object.entries(updatedBookings).find(
      ([_, b]) => b.id === bookingId
    )
    if (entry) {
      const [key, booking] = entry
      updatedBookings[key] = { ...booking, status: "cancelled" }
      setBookings(updatedBookings)
    }
    setSelectedBooking(null)
  }

  const handleCreateBooking = (playerName: string, contact: string) => {
    if (!quickBookingSlot) return

    const newBooking: Booking = {
      id: Date.now().toString(),
      playerName,
      contact,
      status: "booked",
      time: quickBookingSlot.time,
      court: quickBookingSlot.court,
    }

    const bookingKey = `${quickBookingSlot.court}-${quickBookingSlot.time}`
    setBookings({ ...bookings, [bookingKey]: newBooking })
    setQuickBookingSlot(null)
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
            <div className="sticky left-0 z-10 bg-white p-4"></div>
            {timeSlots.map((time) => (
              <div
                key={time}
                className="bg-white p-4 text-center text-sm text-muted-foreground"
              >
                {time}
              </div>
            ))}

            {/* Court Rows */}
            {courts
              .filter((c) => (courtFilter === "all" ? true : c === courtFilter))
              .map((court) => (
                <div key={court} className="contents">
                  <div className="sticky left-0 z-10 flex items-center bg-white p-4 text-foreground">
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
        onClose={() => setSelectedBooking(null)}
        onCancel={handleCancelBooking}
        onBookNew={handleRebookFromCancelled}
      />

      <QuickBookingModal
        slot={quickBookingSlot}
        onClose={() => setQuickBookingSlot(null)}
        onCreate={handleCreateBooking}
      />
    </>
  )
}
