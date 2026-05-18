"use client"

import { format } from "date-fns"
import { CalendarDays, Clock3 } from "lucide-react"
import React, { type ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <Card className="p-0">
      <CardContent className="p-5">
        <div className="text-3xl font-semibold">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <div className="mt-1 text-sm text-foreground">{value}</div>
      </div>
    </div>
  )
}

export default function PlaySessionOverview({
  session,
  duration,
  completedMatchesCount,
  activeMatchesCount,
  upcomingMatchesCount,
}: {
  session: {
    participants?: Array<unknown>
    startTime: string | Date
    endTime: string | Date
  }
  duration: number
  completedMatchesCount: number
  activeMatchesCount: number
  upcomingMatchesCount: number
}) {
  return (
    <div className="space-y-0">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard value={duration} label="Minutes" />
        <StatCard value={session.participants?.length || 0} label="Players" />
        <StatCard value={completedMatchesCount} label="Completed" />
        <StatCard
          value={upcomingMatchesCount + activeMatchesCount}
          label="Upcoming / Active"
        />
      </div>

      <Separator className="my-6" />

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoRow
          icon={<CalendarDays className="size-4" />}
          label="Date"
          value={format(new Date(session.startTime), "MMM d, yyyy")}
        />
        <InfoRow
          icon={<Clock3 className="size-4" />}
          label="Time"
          value={`${format(new Date(session.startTime), "h:mm a")} - ${format(new Date(session.endTime), "h:mm a")}`}
        />
      </div>
    </div>
  )
}
