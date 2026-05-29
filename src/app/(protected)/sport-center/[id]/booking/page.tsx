"use client"

import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { BookingServicesCard } from "@/features/booking/components/booking-add-ons-card"
import { BookingAvailableCourtsCard } from "@/features/booking/components/booking-available-courts-card"
import { BookingCourtInfoCard } from "@/features/booking/components/booking-court-info-card"
import { BookingDateSelectionCard } from "@/features/booking/components/booking-date-selection-card"
import { BookingNote } from "@/features/booking/components/booking-note"
import { BookingSummaryCard } from "@/features/booking/components/booking-summary-card"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"

export default function BookingPage() {
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const centerId = Array.isArray(params.id) ? params.id[0] : params.id

  const selectedDate = useBookingStore((state) => state.selectedDate)
  const bookingNote = useBookingStore((state) => state.bookingNote)
  const sportCenter = useBookingStore((state) => state.sportCenter)
  const initializeBooking = useBookingStore((state) => state.initializeBooking)
  const setBookingNote = useBookingStore((state) => state.setBookingNote)
  const fetchCourtAvailability = useBookingStore(
    (state) => state.fetchCourtAvailability
  )
  const fetchServices = useBookingStore((state) => state.fetchServices)
  const fetchProducts = useBookingStore((state) => state.fetchProducts)

  useEffect(() => {
    if (centerId) {
      initializeBooking(centerId)
      void fetchServices(centerId)
      void fetchProducts(centerId)
    }
  }, [centerId, initializeBooking, fetchProducts, fetchServices])

  useEffect(() => {
    if (centerId && selectedDate) {
      void fetchCourtAvailability(centerId, selectedDate)
    }
  }, [centerId, fetchCourtAvailability, selectedDate])

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
          <BookingDateSelectionCard />
          <BookingAvailableCourtsCard />
          <BookingServicesCard />
          <BookingNote note={bookingNote} onNoteChange={setBookingNote} />
        </div>

        <aside className="xl:sticky xl:top-6">
          <BookingSummaryCard />
        </aside>
      </section>
    </PageContainer>
  )
}
