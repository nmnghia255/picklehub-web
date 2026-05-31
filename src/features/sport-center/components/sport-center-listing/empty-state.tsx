"use client"

import { SearchX } from "lucide-react"

export type EmptyStateVariant = "sport-center" | "booking"

interface EmptyStateProps {
  variant?: EmptyStateVariant
}

const emptyStateContent: Record<
  EmptyStateVariant,
  { title: string; description: string }
> = {
  "sport-center": {
    title: "Không tìm thấy kết quả phù hợp",
    description:
      "Bạn có thể thay đổi từ khóa hoặc bộ lọc để có kết quả như ý nhé.",
  },
  booking: {
    title: "Chưa có sân đã đặt",
    description:
      "Bạn chưa đánh dấu sân nào vào danh sách đã đặt. Hãy chọn một sân để theo dõi nhanh tại đây.",
  },
}

export function EmptyState({ variant = "sport-center" }: EmptyStateProps) {
  const content = emptyStateContent[variant]

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold">{content.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {content.description}
      </p>
    </div>
  )
}
