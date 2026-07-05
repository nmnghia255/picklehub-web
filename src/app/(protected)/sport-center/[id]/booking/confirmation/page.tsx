"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { submitBookingsAction } from "@/features/sport-center/actions/submit-booking-action"
import { BookingConfirmationBookedSlotsCard } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-booked-slots-card"
import { BookingConfirmationDetailsCard } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-details-card"
import { BookingConfirmationEmptyState } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-empty-state"
import { BookingConfirmationHeader } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-header"
import { BookingConfirmationItemsCard } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-items-card"
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
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"
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

function formatDate(
  value: Date | undefined,
  t: (key: string, options?: Record<string, unknown>) => string,
  i18n: { language: string }
) {
  if (!value) return t("booking.confirmation.noDate")

  return value.toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function BookingConfirmationPage() {
  const { t } = useSportCenterTranslation()
  const { i18n } = useTranslation()
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const centerId = Array.isArray(params.id) ? params.id[0] : params.id
  const [submitError, setSubmitError] = useState("")

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

  const selectedDateText = useMemo(
    () => formatDate(bookingDraft.selectedDate, t, i18n),
    [bookingDraft.selectedDate, t, i18n]
  )

  const totalSlots = useMemo(() => {
    return Object.values(bookingDraft.selectedCourts).reduce(
      (sum, slots) => sum + slots.size,
      0
    )
  }, [bookingDraft.selectedCourts])

  const courtTotal = useMemo(() => {
    if (!bookingDraft.courtAvailability) {
      return totalSlots * toNumber(sportCenter?.basePrice)
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
            slotSum + toNumber(slot?.pricePerHour ?? sportCenter?.basePrice)
          )
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
      return sum + toNumber(service.price)
    }, 0)
  }, [bookingDraft.selectedServices, bookingDraft.services])

  const productTotal = useMemo(() => {
    return bookingDraft.products.reduce((sum, product) => {
      const quantity = bookingDraft.selectedProducts[product.id] ?? 0
      return sum + toNumber(product.price) * quantity
    }, 0)
  }, [bookingDraft.products, bookingDraft.selectedProducts])

  const total = courtTotal + serviceTotal + productTotal
  const totalDisplay = formatCurrencyVnd(total)
  const centerName =
    sportCenter?.name ?? t("booking.confirmation.defaultCenterName")
  const canConfirm =
    totalSlots > 0 && !!bookingDraft.selectedDate && !isSubmitting

  const handleCreateBooking = async () => {
    if (!centerId) {
      setSubmitError(t("booking.confirmation.errorNoCenterId"))
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const submitted = await submitBookingsAction({
        centerId: centerId,
        selectedDate: bookingDraft.selectedDate,
        selectedCourts: Object.fromEntries(
          Object.entries(bookingDraft.selectedCourts).map(
            ([courtId, slots]) => [courtId, Array.from(slots)]
          )
        ),
        selectedServices: bookingDraft.selectedServices,
        selectedProducts: bookingDraft.selectedProducts,
        note: bookingDraft.bookingNote,
        useCredit: useBookingStore.getState().useCredit,
        serviceItems: bookingDraft.services,
        productItems: bookingDraft.products,
      })

      if (!submitted.success) {
        setSubmitError(
          submitted.error ?? t("booking.confirmation.errorCreateBooking")
        )
        return
      }

      const bookingData = submitted.booking
      const bookingId =
        (Array.isArray(bookingData) ? bookingData[0]?.id : bookingData?.id) ??
        ""
      useBookingStore.setState({
        lastBookingId: bookingId || null,
        submitMessage:
          submitted.message ?? t("booking.confirmation.successSubmit"),
      })
      const paymentPath = `/sport-center/${centerId}/booking/confirmation/payment?bookingId=${bookingId}`

      router.push(paymentPath)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : t("booking.confirmation.errorCreateBooking")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

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
          )?.courtName ?? t("booking.summary.courtId", { id: courtId }),
        slots: Array.from(slots),
      })),
    [bookingDraft.courtAvailability?.courts, bookingDraft.selectedCourts, t]
  )

  if (!sportCenter || totalSlots === 0) {
    return <BookingConfirmationEmptyState />
  }

  return (
    <PageContainer
      variant="wide"
      className="flex min-h-screen flex-col gap-6 py-8"
    >
      <section>
        <BookingConfirmationHeader onBack={() => router.back()} />
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

        <div>
          <Button
            className="w-full"
            onClick={() => void handleCreateBooking()}
            disabled={!canConfirm}
          >
            {t("booking.confirmation.confirmAndPayBtn")}
          </Button>
          {submitError ? (
            <p className="mt-2 text-sm text-destructive">{submitError}</p>
          ) : null}
        </div>
      </section>
    </PageContainer>
  )
}
