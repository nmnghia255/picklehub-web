"use client"

import type { LucideIcon } from "lucide-react"

interface BookingDetailFieldProps {
  label: string
  value: string
  icon?: LucideIcon
  toneClassName?: string
}

export function BookingDetailField({
  label,
  value,
  icon: Icon,
  toneClassName = "text-sky-500",
}: BookingDetailFieldProps) {
  return (
    <div className="rounded-2xl border bg-background/80 p-3 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon ? <Icon className={`size-4 ${toneClassName}`} /> : null}
        <span>{label}</span>
      </div>
      <div className="text-md mt-1 font-medium text-foreground">{value}</div>
    </div>
  )
}
