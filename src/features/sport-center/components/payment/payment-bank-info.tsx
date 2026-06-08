"use client"

import { QrCode } from "lucide-react"

import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

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
  const { t } = useSportCenterTranslation()
  return (
    <div className="space-y-4 rounded-2xl border border-dashed p-4">
      <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border bg-muted/40 p-2">
          {paymentQrUrl ? (
            <img
              src={paymentQrUrl}
              alt={t("booking.payment.qrImageAlt")}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              {t("booking.payment.noQr")}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {t("booking.payment.transferInfo")}
            </p>
            <p className="text-sm text-muted-foreground">{paymentBankName}</p>
            <p className="mt-1 text-lg font-semibold">{paymentAccountName}</p>
            <p className="text-sm font-medium">{paymentAccountNumber}</p>
          </div>

          <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
            <QrCode className="mb-2 size-4 text-primary" />
            {t("booking.payment.checkInfoBeforeConfirm")}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentBankInfo
