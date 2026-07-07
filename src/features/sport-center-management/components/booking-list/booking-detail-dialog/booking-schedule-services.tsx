"use client"

import { ReceiptText } from "lucide-react"

import type { Booking } from "../../../types/booking"
import { formatCurrency } from "../booking-list.utils"

interface Props {
  booking: Booking
  variant?: "card" | "ghost"
}

export function BookingScheduleServices({ booking, variant = "card" }: Props) {
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
        Chi tiết lịch và dịch vụ
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-muted/20 p-4">
          <div className="text-md mb-3 font-medium">Danh sách sân</div>
          <div className="space-y-2 text-sm text-muted-foreground">
            {(booking.bookingItems?.length ?? 0) > 0 ? (
              booking.bookingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3 text-foreground"
                >
                  <span className="font-medium">
                    {item.court?.name ?? "Sân"}
                  </span>
                  <span>
                    {item.startTime} - {item.endTime}
                  </span>
                </div>
              ))
            ) : (
              <p>Không có sân được ghi nhận.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-muted/20 p-4">
          <div className="text-md mb-3 font-medium">Dịch vụ và sản phẩm</div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <ReceiptText className="size-4 text-violet-500" />
                Dịch vụ
              </div>
              {booking.bookingServices.length > 0 ? (
                <div className="space-y-2">
                  {booking.bookingServices.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-xl border bg-background p-3 text-foreground"
                    >
                      <div className="font-medium">
                        {service.service?.name ?? "Dịch vụ"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Số lượng: {service.quantity} · Đơn giá:{" "}
                        {formatCurrency(service.price)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Không có dịch vụ.</p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <ReceiptText className="size-4 text-violet-500" />
                Sản phẩm
              </div>
              {booking.bookingProducts.length > 0 ? (
                <div className="space-y-2">
                  {booking.bookingProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-xl border bg-background p-3 text-foreground"
                    >
                      <div className="font-medium">
                        {product.product?.name ?? "Sản phẩm"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Số lượng: {product.quantity} · Đơn giá:{" "}
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Không có sản phẩm.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BookingScheduleServices
