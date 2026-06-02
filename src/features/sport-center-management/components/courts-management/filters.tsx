import { Calendar as CalendarIcon, ChevronDown, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Court } from "../../types/court"
import { SportCenterSelector } from "./sport-center-selector"

interface FiltersProps {
  date: string
  setDate: (d: string) => void
  courtFilter: string
  setCourtFilter: (c: string) => void
  courts: Court[]
}

export function Filters({
  date,
  setDate,
  courtFilter,
  setCourtFilter,
  courts,
}: FiltersProps) {
  return (
    <div className="dark:bg-surface flex items-center justify-between border-b border-border bg-background p-4">
      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          {/* Calendar Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {date ? new Date(date).toLocaleDateString() : "Chọn ngày"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-2">
              <Calendar
                mode="single"
                selected={date ? new Date(date) : undefined}
                onSelect={(d) => {
                  if (d instanceof Date) setDate(d.toISOString().slice(0, 10))
                }}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Court Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <span>
                  {courtFilter === "all"
                    ? "Tất cả sân"
                    : (courts.find((c) => c.name === courtFilter)?.name ??
                      "Chọn sân")}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => setCourtFilter("all")}>
                Tất cả sân
              </DropdownMenuItem>
              {courts.map((court) => {
                return (
                  <DropdownMenuItem
                    key={court.id}
                    onClick={() => setCourtFilter(court.name)}
                  >
                    {court.name}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sport Center Filter */}
          <SportCenterSelector />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm border-2 border-emerald-300 bg-linear-to-br from-emerald-50 to-teal-50 dark:border-emerald-600 dark:from-emerald-700 dark:to-teal-700"></div>
            <span className="text-muted-foreground">Đã đặt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm border-2 border-amber-300 bg-linear-to-br from-amber-50 to-yellow-50 dark:border-amber-600 dark:from-amber-700 dark:to-yellow-700"></div>
            <span className="text-muted-foreground">Chờ xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="dark:bg-surface h-3 w-3 rounded-sm border-2 border-dashed border-border bg-background"></div>
            <span className="text-muted-foreground">Còn trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm border-2 border-red-300 bg-linear-to-br from-red-50 to-rose-50 dark:border-red-600 dark:from-red-700 dark:to-rose-700"></div>
            <span className="text-muted-foreground">Đã hủy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
