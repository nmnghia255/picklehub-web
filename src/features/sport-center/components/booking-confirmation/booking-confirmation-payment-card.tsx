"use client"

import { CheckCircle2, Landmark, QrCode } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"

type BookingConfirmationPaymentCardProps = {
  paymentAccountName: string
  paymentBankName: string
  paymentAccountNumber: string
  paymentQrUrl: string
  canConfirm: boolean
  isSubmitting: boolean
  submitMessage: string
  submitError: string
  hasCreatedBooking: boolean
  onConfirm: () => void
}

export function BookingConfirmationPaymentCard({
  paymentAccountName,
  paymentBankName,
  paymentAccountNumber,
  paymentQrUrl,
  canConfirm,
  isSubmitting,
  submitMessage,
  submitError,
  hasCreatedBooking,
  onConfirm,
}: BookingConfirmationPaymentCardProps) {
  const useCredit = useBookingStore((state) => state.useCredit)
  const setUseCredit = useBookingStore((state) => state.setUseCredit)

  return (
    <Card className="border shadow-lg shadow-black/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Landmark className="size-5" />
          Phương thức thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setUseCredit(true)}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              useCredit
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-muted/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="size-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold">Dùng credit</p>
                <p className="text-sm text-muted-foreground">
                  Thanh toán bằng số credit hiện có của bạn.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setUseCredit(false)}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              !useCredit
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-muted/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-sky-100 p-2 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                <Landmark className="size-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold">Chuyển khoản ngân hàng</p>
                <p className="text-sm text-muted-foreground">
                  Thanh toán theo thông tin ngân hàng của sân.
                </p>
              </div>
            </div>
          </button>
        </div>

        {useCredit ? (
          <div className="rounded-2xl border border-dashed p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="size-4" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Thanh toán bằng credit</p>
                <p className="text-sm text-muted-foreground">
                  Hệ thống sẽ dùng số credit khả dụng của bạn để tạo booking.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-dashed p-4">
            <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-2xl border bg-muted/40 p-2">
                {paymentQrUrl ? (
                  <img
                    src={paymentQrUrl}
                    alt="Mã QR thanh toán"
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                    Chưa có QR thanh toán.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">
                    Thông tin chuyển khoản
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {paymentBankName}
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {paymentAccountName}
                  </p>
                  <p className="text-sm font-medium">{paymentAccountNumber}</p>
                </div>

                <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                  <QrCode className="mb-2 size-4 text-primary" />
                  Kiểm tra lại thông tin đặt sân, sau đó xác nhận để tạo
                  booking.
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          onClick={onConfirm}
          disabled={!canConfirm || isSubmitting || hasCreatedBooking}
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 size-4" />
              Đang tạo booking...
            </>
          ) : (
            "Xác nhận và tạo booking"
          )}
        </Button>
      </CardContent>

      {submitMessage && (
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertTitle>Hoàn tất</AlertTitle>
          <AlertDescription>{submitMessage}</AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert variant="destructive">
          <AlertTitle>Có lỗi xảy ra</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        Booking chỉ được tạo sau khi bạn xác nhận ở bước này.
      </div>
    </Card>
  )
}
