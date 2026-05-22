"use client"

import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Hourglass,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface ReservationStatsProps {
  totalReservations: number
  activeHolds: number
  expiringSoon: number
  confirmed: number
  expired: number
}

const statCards = [
  {
    key: "totalReservations",
    label: "Total Reservations",
    icon: CalendarClock,
    iconClass: "text-sky-600",
  },
  {
    key: "activeHolds",
    label: "Active Holds",
    icon: Hourglass,
    iconClass: "text-amber-600",
  },
  {
    key: "expiringSoon",
    label: "Expiring Soon",
    icon: CircleAlert,
    iconClass: "text-orange-600",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
  },
  {
    key: "expired",
    label: "Expired",
    icon: Clock3,
    iconClass: "text-slate-600",
  },
] as const

export function ReservationStats({
  totalReservations,
  activeHolds,
  expiringSoon,
  confirmed,
  expired,
}: ReservationStatsProps) {
  const values = {
    totalReservations,
    activeHolds,
    expiringSoon,
    confirmed,
    expired,
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {statCards.map((card) => {
        const Icon = card.icon

        return (
          <Card
            key={card.key}
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
                  {values[card.key]}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
