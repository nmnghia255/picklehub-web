"use client"

import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { BookingServicesCard } from "@/features/booking/components/booking-add-ons-card"
import { BookingAvailableCourtsCard } from "@/features/booking/components/booking-available-courts-card"
import { BookingCourtInfoCard } from "@/features/booking/components/booking-court-info-card"
import { BookingDateSelectionCard } from "@/features/booking/components/booking-date-selection-card"
import { BookingNote } from "@/features/booking/components/booking-note"
import { BookingSummaryCard } from "@/features/booking/components/booking-summary-card"
import { ADD_ONS, COURT_PRICE } from "@/features/booking/data"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"

export default function BookingPage() {
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const centerId = Array.isArray(params.id) ? params.id[0] : params.id

  const selectedDate = useBookingStore((state) => state.selectedDate)
  const selectedCourts = useBookingStore((state) => state.selectedCourts)
  const courtAvailability = useBookingStore((state) => state.courtAvailability)
  const isLoadingAvailability = useBookingStore(
    (state) => state.isLoadingAvailability
  )
  const availabilityError = useBookingStore((state) => state.availabilityError)
  const extras = useBookingStore((state) => state.extras)
  const bookingNote = useBookingStore((state) => state.bookingNote)
  const sportCenter = useBookingStore((state) => state.sportCenter)
  const isSubmitting = useBookingStore((state) => state.isSubmitting)
  const submitMessage = useBookingStore((state) => state.submitMessage)
  const submitError = useBookingStore((state) => state.submitError)
  const initializeBooking = useBookingStore((state) => state.initializeBooking)
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate)
  const toggleCourtSlot = useBookingStore((state) => state.toggleCourtSlot)
  const setExtras = useBookingStore((state) => state.setExtras)
  const setBookingNote = useBookingStore((state) => state.setBookingNote)
  const fetchCourtAvailability = useBookingStore(
    (state) => state.fetchCourtAvailability
  )
  const services = useBookingStore((state) => state.services)
  const fetchServices = useBookingStore((state) => state.fetchServices)
  const submitBookings = useBookingStore((state) => state.submitBookings)

  useEffect(() => {
    if (centerId) {
      initializeBooking(centerId)
      void fetchServices(centerId)
    }
  }, [centerId, initializeBooking, fetchServices])

  useEffect(() => {
    if (centerId && selectedDate) {
      void fetchCourtAvailability(centerId, selectedDate)
    }
  }, [centerId, fetchCourtAvailability, selectedDate])

  const selectedDateText = useMemo(() => {
    if (!selectedDate) return "No date selected"
    return selectedDate.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }, [selectedDate])

  const totalSlots = useMemo(() => {
    return Object.values(selectedCourts).reduce(
      (sum, slots) => sum + slots.size,
      0
    )
  }, [selectedCourts])

  const addOnTotal = useMemo(() => {
    return ADD_ONS.reduce((sum, addon) => {
      if (!extras[addon.key]) return sum
      return sum + addon.price
    }, 0)
  }, [extras])

  const total = COURT_PRICE * totalSlots + addOnTotal

  const canConfirm = totalSlots > 0 && !!selectedDate && !isSubmitting

  return (
    <PageContainer variant="wide" className="flex flex-col">
      <section className="mb-6 flex items-start justify-between gap-4 space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đặt sân</h1>
          <p className="text-sm text-muted-foreground">
            Chọn ngày, sân và khung giờ bạn muốn đặt. Bạn cũng có thể thêm các
            dịch vụ bổ sung.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="size-4" /> Quay lại
        </Button>
      </section>

      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <BookingCourtInfoCard sportCenter={sportCenter} />
          <BookingDateSelectionCard
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <BookingAvailableCourtsCard
            availability={courtAvailability}
            isLoading={isLoadingAvailability}
            error={availabilityError}
            selectedCourts={selectedCourts}
            onToggleCourtSlot={toggleCourtSlot}
          />
          <BookingServicesCard
            services={services}
            extras={extras}
            onSetExtras={setExtras}
            note={bookingNote}
            onNoteChange={setBookingNote}
          />
          <BookingNote note={bookingNote} onNoteChange={setBookingNote} />
        </div>

        <aside className="xl:sticky xl:top-6">
          <BookingSummaryCard
            selectedDateText={selectedDateText}
            totalSlots={totalSlots}
            selectedCourts={selectedCourts}
            courtPrice={COURT_PRICE}
            addOnTotal={addOnTotal}
            total={total}
            onConfirm={() => void submitBookings()}
            isSubmitting={isSubmitting}
            canConfirm={canConfirm}
            statusMessage={submitMessage}
            errorMessage={submitError}
          />
        </aside>
      </section>
    </PageContainer>
  )
}
