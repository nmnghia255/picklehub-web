"use client"

import { SearchX } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold">Không tìm thấy kết quả phù hợp</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Bạn có thể thay đổi từ khóa hoặc bộ lọc để có kết quả như ý nhé.
      </p>
    </div>
  )
}
