"use client"

import { Coins, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function CreditEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <Card className="border-dashed bg-card/80">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="rounded-full border bg-background p-4 shadow-sm">
          <Coins className="size-8 text-muted-foreground" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <Button onClick={onAction} variant="outline">
          <ShieldCheck className="mr-2 size-4" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}
