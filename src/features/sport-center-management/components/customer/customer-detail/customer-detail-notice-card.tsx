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
    <section className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children ? (
        <div className="mt-4 flex justify-end gap-2">{children}</div>
      ) : null}
    </section>
  )
}

export default CustomerDetailNoticeCard
