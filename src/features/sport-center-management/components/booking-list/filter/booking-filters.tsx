"use client"

import { FilterX } from "lucide-react"
import { CalendarDays } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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

import type { BookingStatus } from "../../../types/booking"
import type { BookingCreatedAtFilter } from "../booking-list.utils"
import {
  bookingStatusOptions,
  formatBookingDate,
  getBookingStatusLabel,
} from "../booking-list.utils"

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
    <div className="grid items-end gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
      {/* Date filter */}
      <div className="w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                id={createdAtInputId}
                readOnly
                value={
                  createdAtFilter === "all"
                    ? ""
                    : formatBookingDate(createdAtFilter)
                }
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

                  const key =
                    `${year}-${month}-${day}` as BookingCreatedAtFilter

                  onCreatedAtFilterChange(key)
                  setOpen(false)
                }}
              />

              <div className="flex justify-end p-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onCreatedAtFilterChange("all")
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
      <div className="h-10 w-full">
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            onStatusFilterChange(value as "all" | BookingStatus)
          }
        >
          <SelectTrigger className="h-10! w-full py-0">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>

          <SelectContent>
            {bookingStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.value === "all"
                  ? option.label
                  : getBookingStatusLabel(option.value)}
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
  )
}
