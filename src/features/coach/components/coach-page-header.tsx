import type { ReactNode } from "react"

import { BackButton } from "@/components/common/back-button"

type CoachPageHeaderProps = {
  title: string
  description: string
  backTo?: string
  actions?: ReactNode
}

export function CoachPageHeader({
  title,
  description,
  backTo,
  actions,
}: CoachPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {(backTo || actions) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {backTo && <BackButton to={backTo} />}
          {actions}
        </div>
      )}
    </div>
  )
}
