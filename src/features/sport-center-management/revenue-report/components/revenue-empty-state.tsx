"use client"

import { FileSearch } from "lucide-react"

export function RevenueEmptyState({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed bg-muted/20 px-6 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileSearch className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          Thử điều chỉnh bộ lọc hoặc làm mới dữ liệu.
        </p>
      </div>
    </div>
  )
}
