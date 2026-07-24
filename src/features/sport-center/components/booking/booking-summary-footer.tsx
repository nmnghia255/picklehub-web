"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"
import { useSportCenterStore } from "@/features/sport-center/stores/sport-center-store"
import type { Product } from "@/features/sport-center/types/product"
import type { Service } from "@/features/sport-center/types/service"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

function toAmount(value: number | string | null | undefined) {
  const normalized = Number(value ?? 0)
  return Number.isFinite(normalized) ? normalized : 0
}

export function BookingSummaryFooter() {
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
    const day = String(selectedDate.getDate()).padStart(2, "0")
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
    const year = selectedDate.getFullYear()
    return `${day}/${month}/${year}`
  }, [selectedDate, t])

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
    <div className="sticky bottom-0 z-40 mt-6 -mb-6 rounded-t-xl border-x border-t border-gray-200 bg-white/95 px-6 py-4 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xs dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
      <div className="mx-auto flex w-full flex-row items-center justify-between">
        {/* Left Side: Selected Slots Summary & Popover for breakdown */}
        <div className="flex shrink-0 items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs sm:text-sm">
            <span className="font-semibold text-gray-700 dark:text-zinc-300">
              {selectedDateText}
            </span>
            <span className="mx-2 text-gray-300 dark:text-zinc-700">|</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {totalSlots > 0
                ? t("booking.summary.hoursCount", { count: totalSlots })
                : t("booking.summary.unselected")}
            </span>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 sm:text-sm dark:text-emerald-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                disabled={totalSlots === 0}
              >
                {t("booking.summary.totalCostTitle")}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              align="center"
              side="top"
              sideOffset={8}
            >
              <h4 className="dark:border-zinc-850 dark:text-zinc-150 mb-2 border-b pb-1.5 text-sm font-bold text-gray-800">
                {t("booking.summary.totalCostTitle")}
              </h4>

              {/* Selected Courts Slots details */}
              <div className="mb-3 max-h-60 space-y-2 overflow-y-auto pr-1 text-xs">
                {Object.entries(selectedCourts).map(
                  ([courtIdStr, slots], index) => {
                    const court = courtAvailability?.courts.find(
                      (c) => c.courtId === courtIdStr
                    )
                    const courtName =
                      court?.courtName ??
                      t("booking.summary.courtId", { id: courtIdStr })

                    return (
                      <div
                        key={courtIdStr}
                        className={`space-y-1 ${index !== 0 ? "border-t border-gray-100 pt-2 dark:border-zinc-800" : ""}`}
                      >
                        <p className="font-semibold text-gray-700 dark:text-zinc-300">
                          {courtName}
                        </p>
                        <div className="space-y-1 pl-2">
                          {Array.from(slots).map((slotKey) => {
                            const [startTime = "", endTime = ""] =
                              slotKey.split(" - ")
                            const slot = court?.slots.find(
                              (s) =>
                                s.startTime === startTime &&
                                s.endTime === endTime
                            )
                            const slotPrice = toAmount(
                              slot?.pricePerHour ?? sportCenter?.basePrice
                            )

                            return (
                              <div
                                key={slotKey}
                                className="flex items-center justify-between text-gray-600 dark:text-zinc-400"
                              >
                                <span>{slotKey}</span>
                                <span className="font-semibold text-gray-800 dark:text-zinc-200">
                                  {formatCurrencyVnd(slotPrice)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }
                )}
              </div>

              <Separator className="my-2" />

              {/* Fees Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 dark:text-zinc-400">
                <div className="flex items-center justify-between">
                  <span>{t("booking.summary.courtFee")}</span>
                  <span className="font-medium text-gray-800 dark:text-zinc-200">
                    {formatCurrencyVnd(courtTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("booking.summary.serviceFee")}</span>
                  <span className="font-medium text-gray-800 dark:text-zinc-200">
                    {formatCurrencyVnd(serviceTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("booking.summary.productFee")}</span>
                  <span className="font-medium text-gray-800 dark:text-zinc-200">
                    {formatCurrencyVnd(productTotal)}
                  </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right Side: Total Price & CTA Button */}
        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <div className="text-right">
            <p className="text-[10px] font-medium text-gray-500 sm:text-xs dark:text-zinc-400">
              {t("booking.summary.totalAmount")}
            </p>
            <p className="text-sm font-extrabold text-emerald-700 sm:text-base dark:text-emerald-400">
              {formatCurrencyVnd(total)}
            </p>
            {statusMessage && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                {statusMessage}
              </p>
            )}
            {errorMessage && (
              <p className="text-[10px] text-destructive">{errorMessage}</p>
            )}
          </div>

          <Button
            className="h-9 bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md sm:h-10 sm:px-6 sm:text-sm"
            disabled={!canConfirm || isSubmitting}
            onClick={handleContinue}
          >
            {t("booking.summary.continueBtn")}
          </Button>
        </div>
      </div>
    </div>
  )
}
