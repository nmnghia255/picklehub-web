"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { submitBookingsAction } from "@/features/sport-center/booking-store-actions"
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
import type { BulkCourtAvailability } from "@/features/sport-center/types/court"
import type { Product } from "@/features/sport-center/types/product"
import type { Service } from "@/features/sport-center/types/service"
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { formatCurrencyVnd } from "@/utils/expense-utils"

type BookingDraft = {
  selectedDate: Date | undefined
  selectedCourts: SelectedCourts
  courtAvailability: BulkCourtAvailability | null
  sportCenter: SportCenter | null
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
      sportCenter: state.sportCenter,
      services: state.services,
      products: state.products,
      selectedServices: state.selectedServices,
      selectedProducts: state.selectedProducts,
      bookingNote: state.bookingNote,
    }
  })

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
      return totalSlots * (bookingDraft.sportCenter?.basePrice ?? 0)
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

          return (
            slotSum +
            (slot?.pricePerHour ?? bookingDraft.sportCenter?.basePrice ?? 0)
          )
        }, 0)

        return courtSum + slotTotal
      },
      0
    )
  }, [
    bookingDraft.courtAvailability,
    bookingDraft.selectedCourts,
    bookingDraft.sportCenter?.basePrice,
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
  const centerName = bookingDraft.sportCenter?.name ?? "Sân pickleball"
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

  if (
    !bookingDraft.sportCenter ||
    !bookingDraft.selectedDate ||
    totalSlots === 0
  ) {
    return <BookingConfirmationEmptyState />
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-background via-background to-muted/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_28%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10">
        <BookingConfirmationHeader
          centerName={centerName}
          selectedDateText={selectedDateText}
          totalSlots={totalSlots}
          totalDisplay={totalDisplay}
          bookingId={createdBookingId}
          onBack={() => router.push(`/sport-center/${centerId}/booking`)}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="space-y-6">
            <BookingConfirmationDetailsCard
              centerName={centerName}
              address={bookingDraft.sportCenter.address}
              selectedDateText={selectedDateText}
              selectedCourtCount={
                Object.keys(bookingDraft.selectedCourts).length
              }
              totalSlots={totalSlots}
              totalDisplay={totalDisplay}
              bookingNote={bookingDraft.bookingNote}
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
          </div>

          <div className="space-y-6">
            <BookingConfirmationPaymentCard
              paymentAccountName={bookingDraft.sportCenter.paymentAccountName}
              paymentBankName={bookingDraft.sportCenter.paymentBankName}
              paymentAccountNumber={
                bookingDraft.sportCenter.paymentAccountNumber
              }
              paymentQrUrl={bookingDraft.sportCenter.paymentQrUrl}
              canConfirm={canConfirm}
              isSubmitting={isSubmitting}
              submitMessage={submitMessage}
              submitError={submitError}
              hasCreatedBooking={Boolean(createdBookingId)}
              onConfirm={() => void handleCreateBooking()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
