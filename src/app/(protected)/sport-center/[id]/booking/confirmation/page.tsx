"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { PageContainer } from "@/components/page-container"
import { submitBookingsAction } from "@/features/sport-center/booking-store-actions"
import { BookingConfirmationBookedSlotsCard } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-booked-slots-card"
import { BookingConfirmationDetailsCard } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-details-card"
import { BookingConfirmationEmptyState } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-empty-state"
import { BookingConfirmationHeader } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-header"
import { BookingConfirmationItemsCard } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-items-card"
import { BookingConfirmationPaymentCard } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-payment-card"
import type {
  ProductSelectionState,
  SelectedCourts,
  ServiceSelectionState,
} from "@/features/sport-center/stores/booking-store"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"
import { useSportCenterStore } from "@/features/sport-center/stores/sport-center-store"
import type { BulkCourtAvailability } from "@/features/sport-center/types/court"
import type { Product } from "@/features/sport-center/types/product"
import type { Service } from "@/features/sport-center/types/service"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { formatCurrencyVnd } from "@/utils/expense-utils"

type BookingDraft = {
  selectedDate: Date | undefined
  selectedCourts: SelectedCourts
  courtAvailability: BulkCourtAvailability | null
  services: Service[]
  products: Product[]
  selectedServices: ServiceSelectionState
  selectedProducts: ProductSelectionState
  bookingNote: string
}

function formatDate(value: Date | undefined) {
  if (!value) return "Chưa chọn ngày"

  return value.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function BookingConfirmationPage() {
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const centerId = Array.isArray(params.id) ? params.id[0] : params.id

  const [bookingDraft] = useState<BookingDraft>(() => {
    const state = useBookingStore.getState()

    return {
      selectedDate: state.selectedDate,
      selectedCourts: state.selectedCourts,
      courtAvailability: state.courtAvailability,
      services: state.services,
      products: state.products,
      selectedServices: state.selectedServices,
      selectedProducts: state.selectedProducts,
      bookingNote: state.bookingNote,
    }
  })

  const sportCenter = useSportCenterStore((s) => s.sportCenter)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [createdBookingId, setCreatedBookingId] = useState("")

  const selectedDateText = useMemo(
    () => formatDate(bookingDraft.selectedDate),
    [bookingDraft.selectedDate]
  )

  const totalSlots = useMemo(() => {
    return Object.values(bookingDraft.selectedCourts).reduce(
      (sum, slots) => sum + slots.size,
      0
    )
  }, [bookingDraft.selectedCourts])

  const courtTotal = useMemo(() => {
    if (!bookingDraft.courtAvailability) {
      return totalSlots * (sportCenter?.basePrice ?? 0)
    }

    return Object.entries(bookingDraft.selectedCourts).reduce(
      (courtSum, [courtId, slots]) => {
        const court = bookingDraft.courtAvailability?.courts.find(
          (item) => item.courtId === courtId
        )

        const slotTotal = Array.from(slots).reduce((slotSum, selectedSlot) => {
          const [startTime = "", endTime = ""] = selectedSlot.split(" - ")
          const slot = court?.slots.find(
            (availableSlot) =>
              availableSlot.startTime === startTime &&
              availableSlot.endTime === endTime
          )

          return slotSum + (slot?.pricePerHour ?? sportCenter?.basePrice ?? 0)
        }, 0)

        return courtSum + slotTotal
      },
      0
    )
  }, [
    bookingDraft.courtAvailability,
    bookingDraft.selectedCourts,
    sportCenter?.basePrice,
    totalSlots,
  ])

  const serviceTotal = useMemo(() => {
    return bookingDraft.services.reduce((sum, service) => {
      if (!bookingDraft.selectedServices[service.id]) return sum
      return sum + service.price
    }, 0)
  }, [bookingDraft.selectedServices, bookingDraft.services])

  const productTotal = useMemo(() => {
    return bookingDraft.products.reduce((sum, product) => {
      const quantity = bookingDraft.selectedProducts[product.id] ?? 0
      return sum + product.price * quantity
    }, 0)
  }, [bookingDraft.products, bookingDraft.selectedProducts])

  const total = courtTotal + serviceTotal + productTotal
  const totalDisplay = formatCurrencyVnd(total)
  const centerName = sportCenter?.name ?? "Sân pickleball"
  const canConfirm =
    totalSlots > 0 && !!bookingDraft.selectedDate && !isSubmitting

  const selectedServices = useMemo(
    () =>
      bookingDraft.services
        .filter((service) => bookingDraft.selectedServices[service.id])
        .map((service) => ({
          id: service.id,
          name: service.name,
          price: service.price,
          quantity: 1,
          lineTotal: service.price,
        })),
    [bookingDraft.selectedServices, bookingDraft.services]
  )

  const selectedProducts = useMemo(
    () =>
      bookingDraft.products
        .filter(
          (product) => (bookingDraft.selectedProducts[product.id] ?? 0) > 0
        )
        .map((product) => {
          const quantity = bookingDraft.selectedProducts[product.id] ?? 0

          return {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity,
            lineTotal: product.price * quantity,
          }
        }),
    [bookingDraft.products, bookingDraft.selectedProducts]
  )

  const courtRows = useMemo(
    () =>
      Object.entries(bookingDraft.selectedCourts).map(([courtId, slots]) => ({
        courtId,
        courtName:
          bookingDraft.courtAvailability?.courts.find(
            (court) => court.courtId === courtId
          )?.courtName ?? `Sân ${courtId}`,
        slots: Array.from(slots),
      })),
    [bookingDraft.courtAvailability?.courts, bookingDraft.selectedCourts]
  )

  const handleCreateBooking = async () => {
    setIsSubmitting(true)
    setSubmitMessage("")
    setSubmitError("")

    try {
      const submitted = await submitBookingsAction()
      if (!submitted) {
        setSubmitError(useBookingStore.getState().submitError)
        return
      }

      const bookingId = useBookingStore.getState().lastBookingId ?? ""
      setCreatedBookingId(bookingId)
      setSubmitMessage(
        bookingId
          ? `Đã tạo booking thành công. Mã đặt sân: ${bookingId}.`
          : "Đã tạo booking thành công."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!sportCenter || totalSlots === 0) {
    console.log("Booking Draft:", bookingDraft)
    return <BookingConfirmationEmptyState />
  }

  return (
    <PageContainer
      variant="wide"
      className="flex min-h-screen flex-col gap-6 py-8"
    >
      <section>
        <BookingConfirmationHeader
          onBack={() => router.push(`/sport-center/${centerId}/booking`)}
        />
      </section>

      <section className="space-y-6">
        <BookingConfirmationDetailsCard
          centerName={centerName}
          address={sportCenter.address}
          selectedDateText={selectedDateText}
          totalDisplay={totalDisplay}
          bookingNote={bookingDraft.bookingNote}
        />

        <BookingConfirmationBookedSlotsCard
          totalSlots={totalSlots}
          selectedCourtCount={Object.keys(bookingDraft.selectedCourts).length}
          courtRows={courtRows}
        />

        <BookingConfirmationItemsCard
          serviceTotalDisplay={
            serviceTotal ? formatCurrencyVnd(serviceTotal) : "0 VND"
          }
          productTotalDisplay={
            productTotal ? formatCurrencyVnd(productTotal) : "0 VND"
          }
          selectedServices={selectedServices}
          selectedProducts={selectedProducts}
        />

        <BookingConfirmationPaymentCard
          paymentAccountName={sportCenter.paymentAccountName}
          paymentBankName={sportCenter.paymentBankName}
          paymentAccountNumber={sportCenter.paymentAccountNumber}
          paymentQrUrl={sportCenter.paymentQrUrl}
          canConfirm={canConfirm}
          isSubmitting={isSubmitting}
          submitMessage={submitMessage}
          submitError={submitError}
          hasCreatedBooking={Boolean(createdBookingId)}
          onConfirm={() => void handleCreateBooking()}
        />
      </section>
    </PageContainer>
  )
}
