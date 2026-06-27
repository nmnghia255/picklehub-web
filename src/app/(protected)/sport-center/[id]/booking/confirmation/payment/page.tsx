"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { PageContainer } from "@/components/page-container"
import { Card, CardContent } from "@/components/ui/card"
import { fetchSportCenterByIdAction } from "@/features/sport-center/actions/fetch-sport-center-by-id"
import { submitPaymentProofAction } from "@/features/sport-center/actions/submit-payment-proof-action"
import { uploadImageAction } from "@/features/sport-center/actions/upload-image-action"
import { BookingConfirmationHeader } from "@/features/sport-center/components/booking-confirmation/booking-confirmation-header"
import { BookingConfirmationPaymentCard } from "@/features/sport-center/components/payment/payment-card"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"
import { useSportCenterStore } from "@/features/sport-center/stores/sport-center-store"
import type { BookingResponse } from "@/features/sport-center/types/booking"
import type { Product } from "@/features/sport-center/types/product"
import type { Service } from "@/features/sport-center/types/service"
import { formatCurrencyVnd } from "@/utils/expense-utils"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ id?: string }>()
  const centerIdParam = params.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : ""

  const sportCenter = useSportCenterStore((s) => s.sportCenter)
  const setSportCenter = useSportCenterStore((s) => s.setSportCenter)
  const lastBookingId = useBookingStore((state) => state.lastBookingId)
  const useCredit = useBookingStore((state) => state.useCredit)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [hasCompleted, setHasCompleted] = useState(false)
  const [paymentProofUrl, setPaymentProofUrl] = useState("")
  const [isUploadingProof, setIsUploadingProof] = useState(false)
  const [creditBalance, setCreditBalance] = useState<number | null>(null)
  const [creditLoading, setCreditLoading] = useState(false)
  const [creditError, setCreditError] = useState("")
  const [loadedTotalPrice, setLoadedTotalPrice] = useState<number | null>(null)
  const [loadingBooking, setLoadingBooking] = useState(false)

  const bookingId = searchParams.get("bookingId") ?? lastBookingId ?? ""

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

  const total =
    loadedTotalPrice !== null
      ? loadedTotalPrice
      : courtTotal + serviceTotal + productTotal
  const totalDisplay = formatCurrencyVnd(total)
  const requiresProof =
    !useCredit || (creditBalance !== null && creditBalance < total)

  // Fetch booking details if not in memory (e.g. direct link from history)
  useEffect(() => {
    let isActive = true

    if (!bookingId) return

    void Promise.resolve().then(() => {
      if (isActive) setLoadingBooking(true)
    })

    fetch(`/api/bookings/${bookingId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải thông tin đặt sân.")
        return res.json() as Promise<
          { data?: BookingResponse } & BookingResponse
        >
      })
      .then((payload) => {
        if (!isActive) return
        const bookingData = payload.data || payload
        if (bookingData) {
          setLoadedTotalPrice(bookingData.totalPrice)
          if (bookingData.center) {
            setSportCenter(bookingData.center)
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load booking details:", err)
      })
      .finally(() => {
        if (isActive) setLoadingBooking(false)
      })

    return () => {
      isActive = false
    }
  }, [bookingId, setSportCenter])

  // Fetch sport center profile if not in store
  useEffect(() => {
    let isActive = true
    if (!sportCenter || !sportCenter.id) {
      if (centerIdParam) {
        fetchSportCenterByIdAction(centerIdParam)
          .then((center) => {
            if (isActive) setSportCenter(center)
          })
          .catch((err) => {
            console.error("Failed to load sport center:", err)
          })
      }
    }
    return () => {
      isActive = false
    }
  }, [sportCenter, centerIdParam, setSportCenter])

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

  const handlePaymentProofSelected = async (paymentProofFile: File | null) => {
    setSubmitError("")
    setPaymentProofUrl("")

    if (!paymentProofFile) {
      return
    }

    setIsUploadingProof(true)

    try {
      const uploadedUrl = await uploadImageAction(paymentProofFile)
      setPaymentProofUrl(uploadedUrl)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải được ảnh."
      setSubmitError(message)
      return error
    } finally {
      setIsUploadingProof(false)
    }
  }

  const handleSubmitPaymentProof = async () => {
    setIsSubmitting(true)
    setSubmitMessage("")
    setSubmitError("")

    try {
      if (!bookingId) {
        throw new Error("Không tìm thấy mã đặt sân để tải lên minh chứng.")
      }

      if (!requiresProof) {
        setSubmitMessage("Đã hoàn tất booking bằng credit.")
        setHasCompleted(true)
        return
      }

      if (!paymentProofUrl) {
        throw new Error("Vui lòng tải lên ảnh minh chứng thanh toán.")
      }
      await submitPaymentProofAction(bookingId, paymentProofUrl)

      setSubmitMessage("Đã tải lên minh chứng thanh toán thành công.")
      setHasCompleted(true)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải lên minh chứng thanh toán."
      setSubmitError(message)
      return error
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingBooking || !sportCenter || !sportCenter.id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

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
          canConfirm={Boolean(bookingId)}
          isSubmitting={isSubmitting}
          isUploadingProof={isUploadingProof}
          submitMessage={submitMessage}
          submitError={submitError}
          hasCreatedBooking={hasCompleted}
          onProofSelected={(file) => void handlePaymentProofSelected(file)}
          onConfirm={() => void handleSubmitPaymentProof()}
        />
      </section>
    </PageContainer>
  )
}
