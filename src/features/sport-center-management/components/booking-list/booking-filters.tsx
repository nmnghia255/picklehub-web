"use client"

import { CalendarIcon, ChevronDown, Filter, FilterX } from "lucide-react"
import { CalendarDays } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { BookingStatus } from "../../types/booking"
import { SportCenterSelector } from "../courts-management/sport-center-selector"
import type { BookingCreatedAtFilter } from "./booking-list.utils"
import {
  bookingStatusOptions,
  formatBookingDate,
  getBookingStatusLabel,
} from "./booking-list.utils"

interface BookingFiltersProps {
  createdAtFilter: BookingCreatedAtFilter
  statusFilter: "all" | BookingStatus
  onCreatedAtFilterChange: (value: BookingCreatedAtFilter) => void
  onStatusFilterChange: (value: "all" | BookingStatus) => void
  onResetFilters: () => void
}

export function BookingFilters({
  createdAtFilter,
  statusFilter,
  onCreatedAtFilterChange,
  onStatusFilterChange,
  onResetFilters,
}: BookingFiltersProps) {
  const createdAtInputId = "booking-created-at-filter"
  const [open, setOpen] = useState(false)
  const selectedDate =
    createdAtFilter === "all" ? undefined : new Date(createdAtFilter)

  return (
    <section className="space-y-4 rounded-3xl border bg-card/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Filter className="size-4" />
        <span>Bộ lọc</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(200px,1.3fr)_auto_auto_auto]">
        {/* Date filter */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Ngày tạo</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-full">
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />

                <span className="text-sm">
                  {createdAtFilter === "all"
                    ? "Chọn ngày"
                    : formatBookingDate(createdAtFilter)}
                </span>

                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return

                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, "0")
                  const day = String(date.getDate()).padStart(2, "0")

                  const key =
                    `${year}-${month}-${day}` as BookingCreatedAtFilter

                  onCreatedAtFilterChange(key)
                }}
              />

              <div className="mt-2 flex justify-end border-t pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCreatedAtFilterChange("all")}
                >
                  Đặt lại
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sport center filter */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Trung tâm</p>
          <SportCenterSelector />
        </div>

        {/* Status filter */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Trạng thái
          </p>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <span>
                  {statusFilter === "all"
                    ? "Tất cả trạng thái"
                    : getBookingStatusLabel(statusFilter)}
                </span>

                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
              {bookingStatusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() =>
                    onStatusFilterChange(option.value as "all" | BookingStatus)
                  }
                >
                  {option.value === "all"
                    ? option.label
                    : getBookingStatusLabel(option.value)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Reset button */}
        <div className="flex items-end gap-2">
          <Button variant="outline" onClick={onResetFilters}>
            <FilterX className="size-4" />
            <span className="ml-2">Đặt lại</span>
          </Button>
        </div>
      </div>
    </section>
  )
}
