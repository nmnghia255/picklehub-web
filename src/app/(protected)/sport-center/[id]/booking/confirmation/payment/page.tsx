"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { PageContainer } from "@/components/page-container"
import { Card, CardContent } from "@/components/ui/card"
import { MediaService } from "@/features/sport-center/api/media-service"
import { submitBookingsAction } from "@/features/sport-center/booking-store-actions"
import { BookingConfirmationHeader } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-header"
import { BookingConfirmationPaymentCard } from "@/features/sport-center/components/payment/payment-card"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"
import { useSportCenterStore } from "@/features/sport-center/stores/sport-center-store"
import type { Product } from "@/features/sport-center/types/product"
import type { Service } from "@/features/sport-center/types/service"
import { formatCurrencyVnd } from "@/utils/expense-utils"

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()

  const sportCenter = useSportCenterStore((s) => s.sportCenter)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [createdBookingId, setCreatedBookingId] = useState("")
  const [creditBalance, setCreditBalance] = useState<number | null>(null)
  const [creditLoading, setCreditLoading] = useState(false)
  const [creditError, setCreditError] = useState("")

  // snapshot booking draft from store to calculate totals
  const [bookingDraft] = useState(() => {
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

  function toNumber(value: number | string | null | undefined) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const courtTotal = useMemo(() => {
    const totalSlots = Object.values(bookingDraft.selectedCourts).reduce(
      (sum: number, slots: Set<string>) => sum + slots.size,
      0
    )

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
  ])

  const serviceTotal = useMemo(() => {
    return bookingDraft.services.reduce((sum: number, service: Service) => {
      if (!bookingDraft.selectedServices[service.id]) return sum
      return sum + toNumber(service.price)
    }, 0)
  }, [bookingDraft.selectedServices, bookingDraft.services])

  const productTotal = useMemo(() => {
    return bookingDraft.products.reduce((sum: number, product: Product) => {
      const quantity = bookingDraft.selectedProducts[product.id] ?? 0
      return sum + toNumber(product.price) * quantity
    }, 0)
  }, [bookingDraft.products, bookingDraft.selectedProducts])

  const total = courtTotal + serviceTotal + productTotal
  const totalDisplay = formatCurrencyVnd(total)

  useEffect(() => {
    let isActive = true

    const loadCreditBalance = async () => {
      setCreditLoading(true)
      setCreditError("")

      try {
        const response = await fetch("/api/bookings/credits", {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Không thể tải số dư credit.")
        }

        const payload = (await response.json()) as {
          data?: { balance?: number }
          balance?: number
        }

        const balanceValue = payload.data?.balance ?? payload.balance

        if (isActive) {
          setCreditBalance(
            Number.isFinite(Number(balanceValue)) ? Number(balanceValue) : null
          )
        }
      } catch (error) {
        if (isActive) {
          setCreditError(
            error instanceof Error
              ? error.message
              : "Không thể tải số dư credit."
          )
        }
      } finally {
        if (isActive) {
          setCreditLoading(false)
        }
      }
    }

    void loadCreditBalance()

    return () => {
      isActive = false
    }
  }, [])

  const handleCreateBooking = async (paymentProofFile: File | null) => {
    setIsSubmitting(true)
    setSubmitMessage("")
    setSubmitError("")

    try {
      let paymentProofUrl: string | undefined = undefined

      if (paymentProofFile) {
        paymentProofUrl = await MediaService.uploadImage(paymentProofFile)
      }

      const submitted = await submitBookingsAction(paymentProofUrl)
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

      // return to confirmation overview
      router.back()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Không thể tạo booking."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!sportCenter) return null

  return (
    <PageContainer
      variant="wide"
      className="flex min-h-screen flex-col gap-6 py-8"
    >
      <section>
        <BookingConfirmationHeader onBack={() => router.back()} />
      </section>

      <section>
        <div className="mb-4">
          <Card>
            <CardContent className="grid gap-4 p-4 sm:grid-cols-2 sm:items-center">
              <div>
                <div className="text-sm text-muted-foreground">
                  Tổng thanh toán
                </div>
                <div className="text-2xl font-semibold">{totalDisplay}</div>
              </div>

              <div className="sm:text-right">
                <div className="text-sm text-muted-foreground">
                  Số dư credit
                </div>
                <div className="text-2xl font-semibold">
                  {creditLoading
                    ? "Đang tải..."
                    : creditError
                      ? "Không tải được"
                      : formatCurrencyVnd(creditBalance ?? 0)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <BookingConfirmationPaymentCard
          paymentAccountName={sportCenter.paymentAccountName}
          paymentBankName={sportCenter.paymentBankName}
          paymentAccountNumber={sportCenter.paymentAccountNumber}
          paymentQrUrl={sportCenter.paymentQrUrl}
          totalAmount={total}
          creditBalance={creditBalance}
          creditLoading={creditLoading}
          creditError={creditError}
          canConfirm={true}
          isSubmitting={isSubmitting}
          submitMessage={submitMessage}
          submitError={submitError}
          hasCreatedBooking={Boolean(createdBookingId)}
          onConfirm={(file) => void handleCreateBooking(file)}
        />
      </section>
    </PageContainer>
  )
}
