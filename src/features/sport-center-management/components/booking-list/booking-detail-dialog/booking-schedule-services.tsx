"use client"

import { ReceiptText } from "lucide-react"

import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type { Booking } from "../../../types/booking"
import { formatCurrency } from "../booking-list.utils"

interface Props {
  booking: Booking
}

export function BookingScheduleServices({ booking }: Props) {
  const { t } = useSportCenterManagementTranslation()
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="text-md flex items-center gap-2 font-semibold">
        <ReceiptText className="size-5 text-slate-500" />
        {t("bookingList.detail.scheduleTitle")}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-muted/20 p-4">
          <div className="text-md mb-3 font-medium">
            {t("bookingList.detail.courtsTitle")}
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            {(booking.bookingItems?.length ?? 0) > 0 ? (
              booking.bookingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3 text-foreground"
                >
                  <span className="font-medium">
                    {item.court?.name ?? t("bookingList.card.court")}
                  </span>
                  <span>
                    {item.startTime} - {item.endTime}
                  </span>
                </div>
              ))
            ) : (
              <p>{t("bookingList.detail.noCourts")}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-muted/20 p-4">
          <div className="text-md mb-3 font-medium">
            {t("bookingList.detail.servicesTitle")}
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <ReceiptText className="size-4 text-violet-500" />
                {t("bookingList.detail.services")}
              </div>
              {booking.bookingServices.length > 0 ? (
                <div className="space-y-2">
                  {booking.bookingServices.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-xl border bg-background p-3 text-foreground"
                    >
                      <div className="font-medium">
                        {service.service?.name ??
                          t("bookingList.detail.service")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("bookingList.detail.quantity")}: {service.quantity} ·{" "}
                        {t("bookingList.detail.unitPrice")}:{" "}
                        {formatCurrency(service.price)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>{t("bookingList.detail.noServices")}</p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <ReceiptText className="size-4 text-violet-500" />
                {t("bookingList.detail.products")}
              </div>
              {booking.bookingProducts.length > 0 ? (
                <div className="space-y-2">
                  {booking.bookingProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-xl border bg-background p-3 text-foreground"
                    >
                      <div className="font-medium">
                        {product.product?.name ??
                          t("bookingList.detail.product")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("bookingList.detail.quantity")}: {product.quantity} ·{" "}
                        {t("bookingList.detail.unitPrice")}:{" "}
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>{t("bookingList.detail.noProducts")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BookingScheduleServices
