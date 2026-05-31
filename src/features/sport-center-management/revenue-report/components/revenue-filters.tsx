"use client"

import { CalendarDays, CheckCircle2, Filter, MapPinned } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SportCenter } from "@/features/sport-center-management/api/sport-center-service"

import type { RevenueFilters } from "../store/revenue-store"
import type { RevenueMethod, RevenueStatus } from "../types"

const PRESETS = [
  { key: "7d", label: "7 ngày" },
  { key: "30d", label: "30 ngày" },
  { key: "this-month", label: "Tháng này" },
] as const

export function RevenueFiltersBar({
  filters,
  centers,
  loadingCenters,
  onPreset,
  onDateChange,
  onStatusChange,
  onMethodChange,
  onCenterToggle,
  onLimitChange,
  onReset,
}: {
  filters: RevenueFilters
  centers: SportCenter[]
  loadingCenters: boolean
  onPreset: (preset: "7d" | "30d" | "this-month") => void
  onDateChange: (field: "from" | "to", value: string) => void
  onStatusChange: (status: RevenueStatus | "all") => void
  onMethodChange: (method: RevenueMethod | "all") => void
  onCenterToggle: (centerId: string) => void
  onLimitChange: (limit: number) => void
  onReset: () => void
}) {
  const selectedCenterLabel = (() => {
    if (filters.centerIds.length === 0) return "Tất cả trung tâm"
    if (filters.centerIds.length === 1) {
      const center = centers.find((item) => item.id === filters.centerIds[0])
      return center?.name ?? "1 trung tâm"
    }
    return `${filters.centerIds.length} trung tâm`
  })()

  return (
    <section className="space-y-4 rounded-3xl border bg-card/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Filter className="size-4" />
        <span>Bộ lọc chung</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.key}
            variant="secondary"
            size="sm"
            onClick={() => onPreset(preset.key)}
          >
            {preset.label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={onReset}>
          Đặt lại
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Từ ngày</p>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={filters.from}
              onChange={(event) => onDateChange("from", event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Đến ngày</p>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={filters.to}
              onChange={(event) => onDateChange("to", event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Trung tâm</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between gap-2"
                disabled={loadingCenters}
              >
                <span className="flex items-center gap-2">
                  <MapPinned className="size-4" />
                  {selectedCenterLabel}
                </span>
                <CheckCircle2 className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuCheckboxItem
                checked={filters.centerIds.length === 0}
                onCheckedChange={() => onCenterToggle("all")}
              >
                Tất cả trung tâm
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {centers.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Không có trung tâm nào
                </div>
              ) : (
                centers.map((center) => (
                  <DropdownMenuCheckboxItem
                    key={center.id}
                    checked={filters.centerIds.includes(center.id)}
                    onCheckedChange={() => onCenterToggle(center.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {center.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {center.location ?? "Không có địa chỉ"}
                      </span>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {filters.centerIds.length > 1 ? (
            <p className="text-xs text-muted-foreground">
              API chỉ hỗ trợ lọc 1 trung tâm, hiển thị tổng hợp tất cả.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Trạng thái
          </p>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onStatusChange(value as RevenueStatus | "all")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="PENDING_REVIEW">Chờ duyệt</SelectItem>
              <SelectItem value="SETTLED">Đã quyết toán</SelectItem>
              <SelectItem value="REJECTED">Bị từ chối</SelectItem>
              <SelectItem value="VOIDED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Phương thức
          </p>
          <Select
            value={filters.method}
            onValueChange={(value) =>
              onMethodChange(value as RevenueMethod | "all")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
              <SelectItem value="CASH">Tiền mặt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Hiển thị</p>
          <Select
            value={String(filters.limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="20" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20 dòng</SelectItem>
              <SelectItem value="50">50 dòng</SelectItem>
              <SelectItem value="100">100 dòng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  )
}
