"use client"

import { Clock, ReceiptText } from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
import { formatCurrency } from "../booking-list.utils"

interface Props {
  booking: Booking
  variant?: "card" | "ghost"
}

export function BookingScheduleServices({ booking, variant = "card" }: Props) {
  const { t } = useSportCenterManagementTranslation()

  const items =
    booking.bookingItems && booking.bookingItems.length > 0
      ? booking.bookingItems.map((item) => ({
          id: item.id || `${item.courtId}-${item.startTime}`,
          courtName:
            item.court?.name ||
            item.courtId ||
            t("bookingList.detail.courtsTitle"),
          timeRange: item.endTime
            ? `${item.startTime} - ${item.endTime}`
            : item.startTime,
          price: item.itemPrice ?? 0,
        }))
      : booking.items && booking.items.length > 0
        ? booking.items.map((item) => ({
            id: `${item.courtId}-${item.startTime}`,
            courtName: item.courtName || t("bookingList.detail.courtsTitle"),
            timeRange: item.endTime
              ? `${item.startTime} - ${item.endTime}`
              : item.startTime,
            price: item.courtPrice ?? 0,
          }))
        : []

  const servicesList =
    booking.services && booking.services.length > 0
      ? booking.services.map((s) => ({
          id: s.id,
          name: s.name,
          quantity: s.quantity,
          unitPrice: s.price,
          totalPrice: s.lineTotal ?? s.price * s.quantity,
        }))
      : booking.bookingServices && booking.bookingServices.length > 0
        ? booking.bookingServices.map((s) => ({
            id: s.id,
            name: s.service?.name || t("bookingList.detail.service"),
            quantity: s.quantity,
            unitPrice: s.price,
            totalPrice: s.price * s.quantity,
          }))
        : []

  const productsList =
    booking.products && booking.products.length > 0
      ? booking.products.map((p) => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          unitPrice: p.price,
          totalPrice: p.lineTotal ?? p.price * p.quantity,
        }))
      : booking.bookingProducts && booking.bookingProducts.length > 0
        ? booking.bookingProducts.map((p) => ({
            id: p.id,
            name: p.product?.name || t("bookingList.detail.product"),
            quantity: p.quantity,
            unitPrice: p.price,
            totalPrice: p.price * p.quantity,
          }))
        : []

  const hasExtraItems = servicesList.length > 0 || productsList.length > 0

  return (
    <section
      className={
        variant === "ghost"
          ? "space-y-4"
          : "space-y-4 rounded-3xl border bg-card p-4 shadow-sm"
      }
    >
      <div className="text-md flex items-center gap-2 font-semibold">
        <ReceiptText className="size-5 text-slate-500" />
        {t("bookingList.detail.scheduleTitle")}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {t("bookingList.detail.courtsTitle")}
        </p>

        {items.length > 0 ? (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {items.map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center justify-between gap-3 rounded-2xl bg-muted/40 p-3.5 transition-colors"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                    {item.courtName}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5 text-sky-500" />
                    <span>{item.timeRange}</span>
                  </p>
                </div>

                <div className="text-right text-sm font-semibold text-foreground sm:text-base">
                  {formatCurrency(item.price)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("bookingList.detail.noCourts")}
          </p>
        )}
      </div>

      {hasExtraItems ? (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {t("bookingList.detail.servicesTitle")}
          </p>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {servicesList.map((service, index) => (
              <div
                key={service.id || index}
                className="flex items-center justify-between gap-3 rounded-2xl bg-muted/40 p-3.5"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {service.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {service.quantity} x {formatCurrency(service.unitPrice)}
                  </p>
                </div>
                <div className="text-right text-sm font-semibold text-foreground">
                  {formatCurrency(service.totalPrice)}
                </div>
              </div>
            ))}

            {productsList.map((product, index) => (
              <div
                key={product.id || index}
                className="flex items-center justify-between gap-3 rounded-2xl bg-muted/40 p-3.5"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.quantity} x {formatCurrency(product.unitPrice)}
                  </p>
                </div>
                <div className="text-right text-sm font-semibold text-foreground">
                  {formatCurrency(product.totalPrice)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
