"use client"

import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface CustomerDetailSectionTitleProps {
  icon: LucideIcon
  title: string
  toneClassName: string
}

export function CustomerDetailSectionTitle({
  icon: Icon,
  title,
  toneClassName,
}: CustomerDetailSectionTitleProps) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <Icon className={cn("size-4", toneClassName)} />
      {title}
    </div>
  )
}

export default CustomerDetailSectionTitle
