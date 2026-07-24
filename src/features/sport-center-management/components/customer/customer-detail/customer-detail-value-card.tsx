"use client"

import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface CustomerDetailValueCardProps {
  label: string
  value: string
  icon?: LucideIcon
  toneClassName?: string
  variant?: "default" | "flat" | "ghost"
}

export function CustomerDetailValueCard({
  label,
  value,
  icon: Icon,
  toneClassName = "text-sky-500",
  variant = "flat",
}: CustomerDetailValueCardProps) {
  if (variant === "ghost") {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {Icon ? <Icon className={cn("size-3.5", toneClassName)} /> : null}
          <span>{label}</span>
        </div>
        <div className="text-base font-semibold text-foreground">{value}</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-muted/40 p-3.5 transition-colors">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {Icon ? <Icon className={cn("size-3.5", toneClassName)} /> : null}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-base font-semibold text-foreground">
        {value}
      </div>
    </div>
  )
}

export default CustomerDetailValueCard
