import { CalendarDays, ChevronDown, Filter, FilterX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { BookingHistoryStatusFilter } from "@/features/sport-center/types/booking"
import {
  bookingStatusOptions,
  formatBookingDate,
} from "@/features/sport-center-management/components/booking-list/booking-list.utils"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

interface BookingHistoryFiltersProps {
  statusFilter: BookingHistoryStatusFilter
  dateFilter: string
  hasActiveFilters: boolean
  onStatusFilterChange: (value: BookingHistoryStatusFilter) => void
  onDateFilterChange: (value: string) => void
  onResetFilters: () => void
}

export function BookingHistoryFilters({
  statusFilter,
  dateFilter,
  onStatusFilterChange,
  onDateFilterChange,
  onResetFilters,
}: BookingHistoryFiltersProps) {
  const { t } = useSportCenterTranslation()
  const selectedDate = dateFilter ? new Date(dateFilter) : undefined

  return (
    <div className="sticky top-16 z-30">
      <section className="space-y-4 rounded-3xl border bg-card/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Filter className="size-4" />
          <span>{t("booking.history.filtersTitle")}</span>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(200px,1fr)_auto_auto]">
          {/* Date filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t("booking.history.createdAtTitle")}
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {dateFilter
                        ? formatBookingDate(dateFilter)
                        : t("booking.history.selectDate")}
                    </span>
                  </div>

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

                    onDateFilterChange(`${year}-${month}-${day}`)
                  }}
                />

                <div className="mt-2 flex justify-end border-t pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDateFilterChange("")}
                  >
                    {t("booking.history.reset")}
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t("booking.history.statusTitle")}
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  <span>
                    {bookingStatusOptions.find(
                      (option) => option.value === statusFilter
                    )?.label ?? t("booking.history.allStatus")}
                  </span>

                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56">
                {bookingStatusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() =>
                      onStatusFilterChange(
                        option.value as BookingHistoryStatusFilter
                      )
                    }
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reset button */}
          <div className="flex items-end">
            <Button variant="outline" onClick={onResetFilters}>
              <FilterX className="size-4" />
              <span className="ml-2">{t("booking.history.reset")}</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
