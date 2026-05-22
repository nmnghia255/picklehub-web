"use client"

import { BadgeDollarSign, Coins } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { formatCurrencyVnd } from "../../credit-management/court-credits-data"

export function CreditStats({
  totalCreditValue,
  totalCredits,
}: {
  totalCreditValue: number
  totalCredits: number
}) {
  const cards = [
    {
      label: "Total Credit Value",
      value: formatCurrencyVnd(totalCreditValue),
      icon: BadgeDollarSign,
      iconClass: "text-sky-600",
    },
    {
      label: "Total Credits",
      value: totalCredits,
      icon: Coins,
      iconClass: "text-emerald-600",
    },
  ] as const

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card
            key={card.label}
            className="overflow-hidden border bg-card/95 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="inline-flex rounded-2xl border bg-background p-3 shadow-sm">
                  <Icon className={`size-5 ${card.iconClass}`} />
                </div>
                <div className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                  Live mock
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-3xl font-semibold tracking-tight">
                  {card.value}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
