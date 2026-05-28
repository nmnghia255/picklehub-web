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
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {Icon ? <Icon className={`size-3.5 ${toneClassName}`} /> : null}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}
