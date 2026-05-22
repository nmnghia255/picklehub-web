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
import { Progress } from "@/components/ui/progress"

import { paymentPlan } from "./expense-data"

export function PaymentInformationCard({
  collectionProgress,
}: {
  collectionProgress: number
}) {
  const [copied, setCopied] = React.useState(false)

  const handleCopyPaymentCode = async () => {
    try {
      await navigator.clipboard.writeText(paymentPlan.paymentCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">Payment Information</CardTitle>
        <CardDescription className="mt-1">
          Share the payment reference and QR code with participants.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_176px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Bank Name
              </p>
              <p className="mt-2 text-lg font-semibold">
                {paymentPlan.bankName}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Payment Code
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="rounded-md bg-background px-2 py-1 text-sm font-semibold text-foreground shadow-sm">
                  {paymentPlan.paymentCode}
                </code>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Payment Note
              </p>
              <p className="mt-2 text-sm font-medium">
                {paymentPlan.paymentNote}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-card p-4 text-center">
            <div className="flex size-32 items-center justify-center rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-4 shadow-inner">
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
            </div>
            <div>
              <p className="text-sm font-medium">
                {paymentPlan.qrPreviewLabel}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Scan-friendly preview for the participant payment flow.
              </p>
            </div>
          </div>
        </div>

        <Progress value={collectionProgress} className="h-2.5" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Collection progress</span>
          <span>{collectionProgress}%</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" className="gap-2" type="button">
            <PenLine className="size-4" />
            Edit Payment Information
          </Button>
          <Button
            variant="secondary"
            className="gap-2"
            type="button"
            onClick={handleCopyPaymentCode}
          >
            <Copy className="size-4" />
            {copied ? "Copied" : "Copy Payment Code"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
