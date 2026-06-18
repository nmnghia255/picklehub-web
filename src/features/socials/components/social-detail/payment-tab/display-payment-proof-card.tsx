"use client"

import React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface DisplayPaymentProofCardProps {
  imageUrl: string
}

export function DisplayPaymentProofCard({
  imageUrl,
}: DisplayPaymentProofCardProps) {
  const { t } = useSocialsTranslation()
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">
          {t("payment.proof", { defaultValue: "Payment Proof" })}
        </CardTitle>
        <CardDescription className="mt-1">
          {t("payment.proofDescription", {
            defaultValue: "Your submitted payment proof image",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center p-6">
        <div className="relative max-w-md overflow-hidden rounded-lg border border-border bg-muted/20">
          {}
          <img
            src={imageUrl}
            alt="Payment Proof"
            className="h-auto max-h-[400px] w-full object-contain"
          />
        </div>
      </CardContent>
    </Card>
  )
}
