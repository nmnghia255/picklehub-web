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
          {t("expenses.tracking.paymentProof")}
        </CardTitle>
        <CardDescription className="mt-1">
          {t("expenses.tracking.paymentProofDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center p-6">
        <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/20">
          {}
          <img
            src={imageUrl}
            alt={t("expenses.tracking.paymentProof")}
            className="h-auto max-h-100 w-full object-contain"
          />
        </div>
      </CardContent>
    </Card>
  )
}
