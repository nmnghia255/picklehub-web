import { CheckCircle2, Landmark, QrCode } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

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
  return (
    <Card className="sticky top-6 border-0 shadow-xl shadow-black/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Landmark className="size-5" />
          Thông tin thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
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
                <p className="mt-1 text-lg font-semibold">
                  {paymentAccountName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {paymentBankName}
                </p>
                <p className="text-sm font-medium">{paymentAccountNumber}</p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                <QrCode className="mb-2 size-4 text-primary" />
                Kiểm tra lại thông tin đặt sân, sau đó xác nhận để tạo booking.
              </div>
            </div>
          </div>

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
        </div>

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
      </CardContent>
    </Card>
  )
}
