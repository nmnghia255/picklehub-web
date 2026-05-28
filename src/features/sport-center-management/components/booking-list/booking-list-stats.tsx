"use client"

import { Card, CardContent } from "@/components/ui/card"

interface BookingListStatsProps {
  bookingCounts: {
    total: number
    pending: number
    confirmed: number
  }
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-border/70 bg-card/90 shadow-sm">
      <CardContent className="px-5 py-4">
        <div className="text-xs tracking-wide text-muted-foreground uppercase">
          {label}
        </div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}

export function BookingListStats({ bookingCounts }: BookingListStatsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <StatCard label="Tổng lượt đặt" value={bookingCounts.total} />
      <StatCard label="Chờ xác nhận" value={bookingCounts.pending} />
      <StatCard label="Đã xác nhận" value={bookingCounts.confirmed} />
    </section>
  )
}
