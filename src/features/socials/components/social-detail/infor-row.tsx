import React, { type ReactNode } from "react"

export function InfoRow({
  icon,
  label,
  value,
  iconClassName = "bg-primary/10 text-primary",
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  iconClassName?: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-primary/15 bg-background/60 p-4">
      <div
        className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <div
          className="mt-1 text-sm font-medium text-foreground"
          suppressHydrationWarning
        >
          {value}
        </div>
      </div>
    </div>
  )
}
