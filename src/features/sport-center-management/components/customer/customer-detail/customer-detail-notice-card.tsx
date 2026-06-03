"use client"

import type { ReactNode } from "react"

interface CustomerDetailNoticeCardProps {
  title: string
  description: string
  children?: ReactNode
}

export function CustomerDetailNoticeCard({
  title,
  description,
  children,
}: CustomerDetailNoticeCardProps) {
  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="space-y-1.5">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="text-base text-muted-foreground">{description}</p>
      </div>
      {children ? (
        <div className="mt-3 flex justify-end gap-2">{children}</div>
      ) : null}
    </section>
  )
}

export default CustomerDetailNoticeCard
