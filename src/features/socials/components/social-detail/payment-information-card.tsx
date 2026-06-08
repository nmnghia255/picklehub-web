"use client"

import { Copy, PenLine } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type { SocialDetail } from "../../types/social"

export function PaymentInformationCard({
  social,
  showEditAction = true,
}: {
  social?: SocialDetail | null
  showEditAction?: boolean
}) {
  const { t } = useSocialsTranslation()
  const [copied, setCopied] = React.useState(false)

  const accountNumber = social?.paymentAccountNumber
  const bankName = social?.paymentBankName
  const accountName = social?.paymentAccountName
  const paymentNote = social?.paymentNote
  const qrUrl = social?.paymentQrUrl

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">
          {t("expenses.paymentInfo.title")}
        </CardTitle>
        <CardDescription className="mt-1">
          {t("expenses.paymentInfo.description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 p-6">
        <div className="grid gap-6 sm:grid-cols-[1fr_minmax(240px,300px)]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {t("expenses.paymentInfo.bankName")}
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {bankName}
              </p>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {t("expenses.paymentInfo.accountNumber")}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <p className="mt-2 text-base font-semibold text-foreground">
                  {accountNumber}
                </p>
              </div>
            </div>

            {accountName && (
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("expenses.paymentInfo.accountName", {
                    defaultValue: "Account Name",
                  })}
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {accountName}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/70 bg-card p-0 text-center">
            <div className="relative flex aspect-square w-full max-w-62.5 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-0 shadow-inner">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Payment QR"
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <div className="grid w-full grid-cols-6 gap-1">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <span
                      key={index}
                      className={`aspect-square rounded-[3px] ${
                        index % 2 === 0 || index % 7 === 0
                          ? "bg-foreground"
                          : "bg-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {t("expenses.paymentInfo.qrPreviewLabel")}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <p className="text-sm font-medium text-muted-foreground">
            {t("expenses.paymentInfo.paymentNote")}
          </p>
          <p className="mt-2 text-base font-medium whitespace-pre-line text-foreground">
            {paymentNote}
          </p>
        </div>

        <div
          className={`grid gap-2 ${showEditAction ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}
        >
          {showEditAction && (
            <Button variant="outline" className="gap-2" type="button">
              <PenLine className="size-4" />
              {t("expenses.paymentInfo.edit")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
