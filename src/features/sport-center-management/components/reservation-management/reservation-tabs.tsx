"use client"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { ReservationTabValue } from "../../../../app/(protected)/sport-center-management/reservation-management/mock-data"

interface ReservationTabsProps {
  value: ReservationTabValue
  onValueChange: (value: ReservationTabValue) => void
}

const tabs: Array<{
  value: ReservationTabValue
  label: string
  count?: number
}> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "awaiting-payment", label: "Awaiting Payment" },
  { value: "expiring-soon", label: "Expiring Soon" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
]

export function ReservationTabs({
  value,
  onValueChange,
}: ReservationTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as ReservationTabValue)}
    >
      <TabsList
        variant="line"
        className="w-full flex-wrap justify-start gap-2 overflow-x-auto pb-1"
      >
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="px-3 py-2">
            {tab.label}
            {typeof tab.count === "number" ? (
              <Badge variant="secondary">{tab.count}</Badge>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
