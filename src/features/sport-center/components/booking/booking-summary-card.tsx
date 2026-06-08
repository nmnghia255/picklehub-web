"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"
import { useSportCenterStore } from "@/features/sport-center/stores/sport-center-store"
import type { CourtSlot } from "@/features/sport-center/types/court"
import type { Product } from "@/features/sport-center/types/product"
import type { Service } from "@/features/sport-center/types/service"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

function toAmount(value: number | string | null | undefined) {
  const normalized = Number(value ?? 0)
  return Number.isFinite(normalized) ? normalized : 0
}

export function BookingSummaryCard() {
  const { t } = useSportCenterTranslation()
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const centerId = Array.isArray(params.id) ? params.id[0] : params.id

  const selectedDate = useBookingStore((state) => state.selectedDate)
  const selectedCourts = useBookingStore((state) => state.selectedCourts)
  const courtAvailability = useBookingStore((state) => state.courtAvailability)
  const sportCenter = useSportCenterStore((state) => state.sportCenter)
  const services = useBookingStore((state) => state.services)
  const products = useBookingStore((state) => state.products)
  const selectedServices = useBookingStore((state) => state.selectedServices)
  const selectedProducts = useBookingStore((state) => state.selectedProducts)
  const total = useBookingStore((state) => state.total)
  const isSubmitting = useBookingStore((state) => state.isSubmitting)
  const statusMessage = useBookingStore((state) => state.submitMessage)
  const errorMessage = useBookingStore((state) => state.submitError)

  const selectedDateText = useMemo(() => {
    if (!selectedDate) return t("booking.summary.noDate")
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

  const courtTotal = useMemo(() => {
    const toNum = (v: number | string | null | undefined) => toAmount(v)

    if (!courtAvailability) {
      return totalSlots * toNum(sportCenter?.basePrice)
    }

    return Object.entries(selectedCourts).reduce(
      (courtSum, [courtId, slots]) => {
        const court = courtAvailability?.courts.find(
          (c) => c.courtId === courtId
        )

        const slotTotal = Array.from(slots).reduce((slotSum, selectedSlot) => {
          const [startTime = "", endTime = ""] = selectedSlot.split(" - ")
          const slot = court?.slots.find(
            (availableSlot) =>
              availableSlot.startTime === startTime &&
              availableSlot.endTime === endTime
          )

          return slotSum + toNum(slot?.pricePerHour ?? sportCenter?.basePrice)
        }, 0)

        return courtSum + slotTotal
      },
      0
    )
  }, [selectedCourts, courtAvailability, sportCenter?.basePrice, totalSlots])

  const serviceTotal = useMemo(() => {
    return services.reduce((sum, service: Service) => {
      if (!selectedServices[service.id]) return sum
      return sum + toAmount(service.price)
    }, 0)
  }, [services, selectedServices])

  const productTotal = useMemo(() => {
    return products.reduce((sum, product: Product) => {
      const quantity = selectedProducts[product.id] ?? 0
      return sum + toAmount(product.price) * quantity
    }, 0)
  }, [products, selectedProducts])

  const canConfirm = totalSlots > 0 && !!selectedDate && !isSubmitting

  const handleContinue = () => {
    router.push(`/sport-center/${centerId}/booking/confirmation`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("booking.summary.totalCostTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t("booking.summary.bookingDate")}
            </span>
            <span className="font-medium">{selectedDateText}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t("booking.summary.courtAndTime")}
            </span>
            <span className="font-medium">
              {totalSlots > 0
                ? t("booking.summary.hoursCount", { count: totalSlots })
                : t("booking.summary.unselected")}
            </span>
          </div>
        </div>

        {totalSlots > 0 && (
          <div className="space-y-2 rounded-lg bg-muted p-3 text-xs">
            {Object.entries(selectedCourts).map(
              ([courtIdStr, slots], index) => (
                <div
                  key={courtIdStr}
                  className={`space-y-1 ${index !== 0 ? "border-t pt-2" : ""}`}
                >
                  <p className="font-medium">
                    {courtAvailability?.courts.find(
                      (court) => court.courtId === courtIdStr
                    )?.courtName ??
                      t("booking.summary.courtId", { id: courtIdStr })}
                    :
                  </p>
                  <p className="text-muted-foreground">
                    {Array.from(slots).join(", ")}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t("booking.summary.courtFee")}
            </span>
            <span>{formatCurrencyVnd(courtTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t("booking.summary.serviceFee")}
            </span>
            <span>{formatCurrencyVnd(serviceTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t("booking.summary.productFee")}
            </span>
            <span>{formatCurrencyVnd(productTotal)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between text-base font-semibold">
          <span>{t("booking.summary.totalAmount")}</span>
          <span>{formatCurrencyVnd(total)}</span>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleContinue}
          disabled={!canConfirm || isSubmitting}
        >
          {t("booking.summary.continueBtn")}
        </Button>

        {statusMessage && (
          <p className="text-sm text-emerald-600">{statusMessage}</p>
        )}

        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}
