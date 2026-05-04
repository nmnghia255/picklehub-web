import React from "react"

export default function Legend() {
  const item = (color: string, label: string) => (
    <div className="mr-3 flex items-center gap-2">
      <div className={`h-4 w-4 rounded-full ${color}`} />
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )

  return (
    <div className="flex items-center">
      {item("bg-gray-200", "Còn trống")}
      {item("bg-green-200", "Đã đặt")}
      {item("bg-yellow-200", "Chờ xác nhận")}
      {item("bg-red-200", "Đã hủy")}
    </div>
  )
}
