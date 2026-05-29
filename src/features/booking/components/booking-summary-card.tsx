"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"
import { formatCurrencyVnd } from "@/utils/expense-utils"

export function BookingSummaryCard() {
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const centerId = Array.isArray(params.id) ? params.id[0] : params.id

  const selectedDate = useBookingStore((state) => state.selectedDate)
  const selectedCourts = useBookingStore((state) => state.selectedCourts)
  const courtAvailability = useBookingStore((state) => state.courtAvailability)
  const sportCenter = useBookingStore((state) => state.sportCenter)
  const services = useBookingStore((state) => state.services)
  const products = useBookingStore((state) => state.products)
  const selectedServices = useBookingStore((state) => state.selectedServices)
  const selectedProducts = useBookingStore((state) => state.selectedProducts)
  const isSubmitting = useBookingStore((state) => state.isSubmitting)
  const statusMessage = useBookingStore((state) => state.submitMessage)
  const errorMessage = useBookingStore((state) => state.submitError)
  const submitBookings = useBookingStore((state) => state.submitBookings)

  const selectedDateText = useMemo(() => {
    if (!selectedDate) return "Chưa chọn ngày"
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
    if (!courtAvailability) {
      return totalSlots * (sportCenter?.basePrice ?? 0)
    }

    return Object.entries(selectedCourts).reduce(
      (courtSum, [courtId, slots]) => {
        const court = courtAvailability.courts.find(
          (c) => c.courtId === courtId
        )
        const slotTotal = Array.from(slots).reduce((slotSum, selectedSlot) => {
          const [startTime = "", endTime = ""] = selectedSlot.split(" - ")
          const slot = court?.slots.find(
            (item) => item.startTime === startTime && item.endTime === endTime
          )

          return slotSum + (slot?.pricePerHour ?? sportCenter?.basePrice ?? 0)
        }, 0)

        return courtSum + slotTotal
      },
      0
    )
  }, [courtAvailability, selectedCourts, sportCenter?.basePrice, totalSlots])

  const serviceTotal = useMemo(() => {
    return services.reduce((sum, service) => {
      if (!selectedServices[service.id]) return sum
      return sum + service.price
    }, 0)
  }, [selectedServices, services])

  const productTotal = useMemo(() => {
    return products.reduce((sum, product) => {
      const quantity = selectedProducts[product.id] ?? 0
      return sum + product.price * quantity
    }, 0)
  }, [products, selectedProducts])

  const total = courtTotal + serviceTotal + productTotal
  const canConfirm = totalSlots > 0 && !!selectedDate && !isSubmitting

  const handleConfirm = async () => {
    router.push(`/sport-center/${centerId}/booking-confirmation`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tổng chi phí</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ngày đặt</span>
            <span className="font-medium">{selectedDateText}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Sân & Khung giờ</span>
            <span className="font-medium">
              {totalSlots > 0 ? `${totalSlots} giờ` : "Chưa chọn"}
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
                    )?.courtName ?? `Sân ${courtIdStr}`}
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
            <span className="text-muted-foreground">Phí sân</span>
            <span>{formatCurrencyVnd(courtTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Dịch vụ</span>
            <span>{formatCurrencyVnd(serviceTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Sản phẩm</span>
            <span>{formatCurrencyVnd(productTotal)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between text-base font-semibold">
          <span>Tổng cộng</span>
          <span>{formatCurrencyVnd(total)}</span>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => void handleConfirm()}
          disabled={!canConfirm || isSubmitting}
        >
          {isSubmitting ? "Đang gửi..." : "Xác nhận"}
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
