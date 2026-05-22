"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { CreditTabValue } from "../../credit-management/court-credits-data"

export function CreditTabs({
  value,
  onValueChange,
}: {
  value: CreditTabValue
  onValueChange: (value: CreditTabValue) => void
}) {
  const tabs: Array<{ value: CreditTabValue; label: string }> = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "partially-used", label: "Partially Used" },
    { value: "used", label: "Used" },
    { value: "expired", label: "Expired" },
  ]

  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as CreditTabValue)}
    >
      <TabsList
        variant="line"
        className="w-full flex-wrap justify-start gap-2 overflow-x-auto pb-1"
      >
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="px-3 py-2">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
