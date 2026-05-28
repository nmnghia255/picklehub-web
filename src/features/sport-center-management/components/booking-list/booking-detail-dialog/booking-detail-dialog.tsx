"use client"

import {
  CalendarDays,
  Clock3,
  Coins,
  History,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { Booking } from "../../../types/booking"
import {
  formatBookingCreatedAt,
  formatBookingDate,
  formatCurrency,
  getBookingDisplayNote,
} from "../booking-list.utils"
import { BookingStatusBadge } from "../booking-status-badge"
import { BookingDetailField } from "./booking-detail-field"

interface BookingDetailDialogProps {
  booking: Booking | null
  onClose: () => void
}

export function BookingDetailDialog({
  booking,
  onClose,
}: BookingDetailDialogProps) {
  if (!booking) return null

  const displayNote = getBookingDisplayNote(booking)
  const firstBookingItem = booking.bookingItems?.[0]
  const courtName = firstBookingItem?.court?.name ?? "Sân"
  const timeRange = firstBookingItem
    ? `${firstBookingItem.startTime} - ${firstBookingItem.endTime}`
    : "—"
  const serviceCount = booking.bookingServices.length
  const productCount = booking.bookingProducts.length

  return (
    <Dialog open={Boolean(booking)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-[96vw]! max-w-[96vw]! overflow-y-auto p-0 sm:w-[88vw]! sm:max-w-[88vw]! lg:w-[75vw]! lg:max-w-[75vw]!">
        <div className="flex h-full flex-col bg-background">
          <DialogHeader className="border-b bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_32%),linear-gradient(to_bottom,rgba(2,6,23,0.02),transparent)] px-6 py-5 text-left sm:text-left">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <DialogTitle className="text-xl">Chi tiết đặt sân</DialogTitle>
                <DialogDescription>
                  Thông tin đầy đủ của lượt đặt này, bao gồm lịch thi đấu, dịch
                  vụ và sản phẩm.
                </DialogDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-sky-200 bg-sky-50 text-sky-700"
                >
                  {booking.playSessionId ?? booking.id}
                </Badge>
                <BookingStatusBadge status={booking.status} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-card/90 p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">Khách hàng</p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {booking.playerName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {booking.phoneNumber || "—"}
                </p>
              </div>
              <div className="rounded-2xl border bg-card/90 p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">Sân / khung giờ</p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {courtName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {timeRange}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 px-6 py-5">
            <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <UserRound className="size-4 text-sky-500" />
                Thông tin khách hàng
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <BookingDetailField
                  label="Tên"
                  value={booking.playerName}
                  icon={UserRound}
                  toneClassName="text-sky-500"
                />
                <BookingDetailField
                  label="Số điện thoại"
                  value={booking.phoneNumber || "—"}
                  icon={UserRound}
                  toneClassName="text-sky-500"
                />
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CalendarDays className="size-4 text-emerald-500" />
                Thông tin đặt sân
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <BookingDetailField
                  label="Mã đặt sân"
                  value={booking.playSessionId ?? booking.id}
                  icon={CalendarDays}
                  toneClassName="text-emerald-500"
                />
                <BookingDetailField
                  label="Tên sân"
                  value={courtName}
                  icon={CalendarDays}
                  toneClassName="text-emerald-500"
                />
                <BookingDetailField
                  label="Ngày đặt"
                  value={formatBookingDate(booking.date)}
                  icon={CalendarDays}
                  toneClassName="text-emerald-500"
                />
                <BookingDetailField
                  label="Khung giờ"
                  value={timeRange}
                  icon={Clock3}
                  toneClassName="text-emerald-500"
                />
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Coins className="size-4 text-orange-500" />
                Thông tin thanh toán
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <BookingDetailField
                  label="Tổng tiền"
                  value={formatCurrency(booking.totalPrice)}
                  icon={Coins}
                  toneClassName="text-orange-500"
                />
                <BookingDetailField
                  label="Tiền còn lại"
                  value={formatCurrency(booking.paymentRemaining)}
                  icon={Coins}
                  toneClassName="text-orange-500"
                />
                <BookingDetailField
                  label="Tiền cọc / credit"
                  value={formatCurrency(booking.creditApplied)}
                  icon={Coins}
                  toneClassName="text-orange-500"
                />
                <BookingDetailField
                  label="Ngày tạo"
                  value={formatBookingCreatedAt(booking.createdAt)}
                  icon={CalendarDays}
                  toneClassName="text-orange-500"
                />
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ReceiptText className="size-4 text-violet-500" />
                Tổng hợp đặt sân
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <BookingDetailField
                  label="Tổng tiền sân"
                  value={formatCurrency(booking.totalCourtPrice)}
                  icon={ReceiptText}
                  toneClassName="text-violet-500"
                />
                <BookingDetailField
                  label="Tổng tiền dịch vụ"
                  value={formatCurrency(booking.totalServicePrice)}
                  icon={ReceiptText}
                  toneClassName="text-violet-500"
                />
                <BookingDetailField
                  label="Tổng tiền sản phẩm"
                  value={formatCurrency(booking.totalProductPrice)}
                  icon={ReceiptText}
                  toneClassName="text-violet-500"
                />
                <BookingDetailField
                  label="Lượt sân"
                  value={String(
                    booking.bookingCount ?? booking.bookingItems?.length ?? 0
                  )}
                  icon={ReceiptText}
                  toneClassName="text-violet-500"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <BookingDetailField
                  label="Dịch vụ"
                  value={String(serviceCount)}
                  icon={ReceiptText}
                  toneClassName="text-violet-500"
                />
                <BookingDetailField
                  label="Sản phẩm"
                  value={String(productCount)}
                  icon={ReceiptText}
                  toneClassName="text-violet-500"
                />
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4 text-rose-500" />
                Thông tin hủy
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <BookingDetailField
                  label="Ngày hủy"
                  value={
                    booking.cancelledAt
                      ? formatBookingCreatedAt(booking.cancelledAt)
                      : "—"
                  }
                  icon={ShieldCheck}
                  toneClassName="text-rose-500"
                />
                <BookingDetailField
                  label="Lý do hủy"
                  value={booking.cancelReason ?? "—"}
                  icon={ShieldCheck}
                  toneClassName="text-rose-500"
                />
                <BookingDetailField
                  label="Thanh toán proof"
                  value={booking.paymentProofUrl ? "Có" : "Không"}
                  icon={ShieldCheck}
                  toneClassName="text-rose-500"
                />
                <BookingDetailField
                  label="Đã upload proof"
                  value={
                    booking.paymentProofUploadedAt
                      ? formatBookingCreatedAt(booking.paymentProofUploadedAt)
                      : "—"
                  }
                  icon={ShieldCheck}
                  toneClassName="text-rose-500"
                />
              </div>
              <div className="rounded-2xl border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Ghi chú</p>
                <p className="mt-1 text-sm leading-6 text-foreground">
                  {displayNote}
                </p>
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MapPinned className="size-4 text-slate-500" />
                Chi tiết lịch và dịch vụ
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="mb-3 text-sm font-medium">Danh sách sân</div>
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
                  <div className="mb-3 text-sm font-medium">
                    Dịch vụ và sản phẩm
                  </div>
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

            <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <History className="size-4 text-slate-500" />
                Ghi chú
              </div>
              <div className="rounded-2xl border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">
                  Ghi chú hệ thống
                </p>
                <p className="mt-1 text-sm leading-6 text-foreground">
                  {displayNote}
                </p>
              </div>
            </section>

            <div className="flex justify-end border-t pt-2">
              <Button onClick={onClose} variant="outline">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
