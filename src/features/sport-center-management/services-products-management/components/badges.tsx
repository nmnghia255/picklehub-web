"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { InventoryKind } from "../store/services-products-store"
import { getProductTypeLabel, getServiceTypeLabel } from "../types"

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
          : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
      )}
    >
      {isActive ? "Đang hoạt động" : "Tạm ngưng"}
    </Badge>
  )
}

export function TypeBadge({
  kind,
  type,
}: {
  kind: InventoryKind
  type: string
}) {
  const label =
    kind === "service" ? getServiceTypeLabel(type) : getProductTypeLabel(type)
  return <Badge variant="secondary">{label}</Badge>
}
