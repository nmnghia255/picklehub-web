"use client"

import { Filter, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { InventoryKind } from "../types"

const productTypeOptions = [
  "Tất cả loại",
  "Bóng",
  "Thiết bị",
  "Đồ uống",
  "Thời trang",
  "Phụ kiện",
]

const serviceTypeOptions = [
  "Tất cả loại",
  "Cho thuê",
  "Huấn luyện",
  "Bảo trì",
  "Tiện ích",
  "Media",
]

interface InventoryFiltersProps {
  kind: InventoryKind
  search: string
  status: string
  type: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onTypeChange: (value: string) => void
  onCreateNew: () => void
}

export function InventoryFilters({
  kind,
  search,
  status,
  type,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onCreateNew,
}: InventoryFiltersProps) {
  const statusOptions =
    kind === "product"
      ? [
          { value: "all", label: "Tất cả trạng thái" },
          { value: "in_stock", label: "Còn hàng" },
          { value: "out_of_stock", label: "Hết hàng" },
        ]
      : [
          { value: "all", label: "Tất cả trạng thái" },
          { value: "active", label: "Đang hoạt động" },
          { value: "paused", label: "Tạm ngưng" },
        ]

  const typeOptions =
    kind === "product" ? productTypeOptions : serviceTypeOptions

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="font-semibold">
            {kind === "product" ? "Danh sách sản phẩm" : "Danh sách dịch vụ"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Tìm kiếm, lọc và quản lý{" "}
            {kind === "product" ? "sản phẩm" : "dịch vụ"} theo từng sân.
          </p>
        </div>

        <Button onClick={onCreateNew} className="gap-2 self-start lg:self-auto">
          <Plus className="size-4" />
          {kind === "product" ? "Thêm sản phẩm" : "Thêm dịch vụ"}
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_220px_220px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={
              kind === "product" ? "Tìm sản phẩm..." : "Tìm dịch vụ..."
            }
            className="pl-9"
          />
        </div>

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <Filter className="size-4 text-muted-foreground" />
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Lọc loại" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Lọc đang áp dụng cho sân hiện tại
        </div>
      </div>
    </div>
  )
}
