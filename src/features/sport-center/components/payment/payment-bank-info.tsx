"use client"

import { QrCode } from "lucide-react"

type PaymentBankInfoProps = {
  paymentQrUrl: string
  paymentBankName: string
  paymentAccountName: string
  paymentAccountNumber: string
}

export function PaymentBankInfo({
  paymentQrUrl,
  paymentBankName,
  paymentAccountName,
  paymentAccountNumber,
}: PaymentBankInfoProps) {
  return (
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
            <p className="text-sm text-muted-foreground">{paymentBankName}</p>
            <p className="mt-1 text-lg font-semibold">{paymentAccountName}</p>
            <p className="text-sm font-medium">{paymentAccountNumber}</p>
          </div>

          <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
            <QrCode className="mb-2 size-4 text-primary" />
            Kiểm tra lại thông tin đặt sân, sau đó xác nhận để tạo booking.
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentBankInfo
