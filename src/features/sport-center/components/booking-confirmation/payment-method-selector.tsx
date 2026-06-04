"use client"

import { CheckCircle2, Landmark } from "lucide-react"
import React from "react"

import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

type Props = {
  useCredit: boolean
  setUseCredit: (v: boolean) => void
}

export function PaymentMethodSelector({ useCredit, setUseCredit }: Props) {
  const { t } = useSportCenterTranslation()
  return (
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
            <p className="font-semibold">{t("booking.payment.useCredit")}</p>
            <p className="text-sm text-muted-foreground">
              {t("booking.payment.useCreditDesc")}
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
            <p className="font-semibold">{t("booking.payment.bankTransfer")}</p>
            <p className="text-sm text-muted-foreground">
              {t("booking.payment.bankTransferDesc")}
            </p>
          </div>
        </div>
      </button>
    </div>
  )
}

export default PaymentMethodSelector
