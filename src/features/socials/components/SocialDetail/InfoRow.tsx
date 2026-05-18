import React, { type ReactNode } from "react"

export default function InfoRow({
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
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <div className="mt-1 text-sm text-foreground">{value}</div>
      </div>
    </div>
  )
}
