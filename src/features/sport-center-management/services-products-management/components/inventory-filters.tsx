"use client"

import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type {
  InventoryKind,
  StatusFilter,
} from "../store/services-products-store"
import { PRODUCT_TYPE_OPTIONS, SERVICE_TYPE_OPTIONS } from "../types"

export function InventoryFilters({
  kind,
  search,
  type,
  status,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onCreate,
}: {
  kind: InventoryKind
  search: string
  type: string
  status: StatusFilter
  onSearchChange: (value: string) => void
  onTypeChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  onCreate: () => void
}) {
  const typeOptions =
    kind === "service" ? SERVICE_TYPE_OPTIONS : PRODUCT_TYPE_OPTIONS

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Tìm kiếm</p>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={kind === "service" ? "Tìm dịch vụ" : "Tìm sản phẩm"}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Loại</p>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Trạng thái</p>
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as StatusFilter)}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Tạm ngưng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onCreate} className="gap-2">
        <Plus className="size-4" />
        {kind === "service" ? "Thêm dịch vụ" : "Thêm sản phẩm"}
      </Button>
    </div>
  )
}
