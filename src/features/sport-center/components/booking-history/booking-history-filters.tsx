import { CalendarDays, FilterX, RefreshCw as RefreshCwIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  bookingStatusOptions,
  formatBookingDate,
} from "@/features/sport-center-management/components/booking-list/booking-list.utils"

import type { BookingHistoryStatusFilter } from "../../../../app/(protected)/sport-center/booking-history/booking-history.types"

interface BookingHistoryFiltersProps {
  statusFilter: BookingHistoryStatusFilter
  dateFilter: string
  hasActiveFilters: boolean
  onStatusFilterChange: (value: BookingHistoryStatusFilter) => void
  onDateFilterChange: (value: string) => void
  onRefresh: () => void
  onResetFilters: () => void
}

export function BookingHistoryFilters({
  statusFilter,
  dateFilter,
  hasActiveFilters,
  onStatusFilterChange,
  onDateFilterChange,
  onRefresh,
  onResetFilters,
}: BookingHistoryFiltersProps) {
  const [open, setOpen] = useState(false)
  const selectedDate = dateFilter ? new Date(dateFilter) : undefined

  return (
    <div className="sticky top-4 z-30 -mx-1">
      <div className="space-y-4 rounded-3xl border bg-background/95 p-4 shadow-lg shadow-slate-950/5 backdrop-blur supports-backdrop-filter:bg-background/85 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
          {/* Date filter */}
          <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    id="booking-history-date"
                    readOnly
                    value={dateFilter ? formatBookingDate(dateFilter) : ""}
                    placeholder="Chọn ngày"
                    className="h-10 w-full pr-10"
                    aria-label="Ngày tạo"
                  />

                  <CalendarDays className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0">
                <div className="p-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (!date) return

                      const year = date.getFullYear()
                      const month = String(date.getMonth() + 1).padStart(2, "0")
                      const day = String(date.getDate()).padStart(2, "0")

                      onDateFilterChange(`${year}-${month}-${day}`)
                      setOpen(false)
                    }}
                  />

                  <div className="flex justify-end p-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onDateFilterChange("")
                        setOpen(false)
                      }}
                    >
                      Đặt lại
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Status filter */}
          <div className="h-10 space-y-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                onStatusFilterChange(value as BookingHistoryStatusFilter)
              }}
            >
              <SelectTrigger
                id="booking-history-status"
                className="h-10! w-full"
              >
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {bookingStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset button */}
          <Button
            variant="outline"
            className="h-10 whitespace-nowrap"
            onClick={onResetFilters}
          >
            <FilterX className="size-4" />
            Đặt lại
          </Button>
        </div>
      </div>
    </div>
  )
}
