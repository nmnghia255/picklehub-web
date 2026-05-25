import React from "react"

export default function Legend() {
  const item = (bgClass: string, darkClass: string, label: string) => (
    <div className="mr-3 flex items-center gap-2">
      <div className={`h-4 w-4 rounded-full ${bgClass} dark:${darkClass}`} />
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )

  return (
    <div className="flex items-center">
      {item(
        "bg-background border border-dashed border-border",
        "bg-surface",
        "Còn trống"
      )}
      {item("bg-emerald-200", "bg-emerald-700", "Đã đặt")}
      {item("bg-amber-200", "bg-amber-700", "Chờ xác nhận")}
      {item("bg-red-200", "bg-red-700", "Đã hủy")}
    </div>
  )
}
