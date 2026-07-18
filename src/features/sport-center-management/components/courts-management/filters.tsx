import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"
import { formatDateOnly, parseDateOnly } from "@/lib/date-only"

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
  const { t, i18n } = useSportCenterManagementTranslation()
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US"
  return (
    <div className="dark:bg-surface flex items-center justify-between border-b border-border bg-background p-4">
      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {t("courts.filters.title")}
        </span>

        <div className="flex items-center gap-2">
          {/* Calendar Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {date
                    ? formatDateOnly(date, locale)
                    : t("courts.filters.datePlaceholder")}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-2">
              <Calendar
                mode="single"
                selected={date ? parseDateOnly(date) : undefined}
                onSelect={(d) => {
                  if (d) {
                    setDate(format(d, "yyyy-MM-dd"))
                  }
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
                    ? t("courts.filters.allCourts")
                    : (courts.find((c) => c.name === courtFilter)?.name ??
                      t("courts.filters.selectedCourt"))}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => setCourtFilter("all")}>
                {t("courts.filters.allCourts")}
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
            <span className="text-muted-foreground">
              {t("courts.filters.legendBooked")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm border-2 border-amber-300 bg-linear-to-br from-amber-50 to-yellow-50 dark:border-amber-600 dark:from-amber-700 dark:to-yellow-700"></div>
            <span className="text-muted-foreground">
              {t("courts.filters.legendPending")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="dark:bg-surface h-3 w-3 rounded-sm border-2 border-dashed border-border bg-background"></div>
            <span className="text-muted-foreground">
              {t("courts.filters.legendAvailable")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm border-2 border-red-300 bg-linear-to-br from-red-50 to-rose-50 dark:border-red-600 dark:from-red-700 dark:to-rose-700"></div>
            <span className="text-muted-foreground">
              {t("courts.filters.legendCancelled")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
