"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface CalendarNavigationProps {
  currentDate: Date
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  className?: string
}

export function CalendarNavigation({
  currentDate,
  onMonthChange,
  onYearChange,
  onPrevMonth,
  onNextMonth,
  onToday,
  className,
}: CalendarNavigationProps) {
  const { t } = useTranslation("common")
  const months = Array.from({ length: 12 }, (_, i) => i)

  const currentYear = currentDate.getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  const handleYearSelect = (value: string | null) => {
    if (value) {
      onYearChange(parseInt(value))
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Button
        variant="secondary"
        onClick={onToday}
        className="h-10 px-4 font-semibold"
      >
        {t("calendar.today", "Hôm nay")}
      </Button>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevMonth}
          className="size-10 rounded-full bg-background shadow-sm transition-all hover:text-primary"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextMonth}
          className="size-10 rounded-full bg-background shadow-sm transition-all hover:text-primary"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={String(currentDate.getMonth())}
          onValueChange={(val) => onMonthChange(parseInt(val))}
        >
          <SelectTrigger className="h-10 w-30 bg-background font-semibold text-foreground shadow-sm">
            <SelectValue placeholder={t("calendar.month", "Tháng")} />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {t(`calendar.months.${m}`, `Tháng ${m + 1}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex h-10 w-auto items-center gap-2 rounded-md border bg-background pl-3 shadow-sm transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <span className="text-sm font-semibold whitespace-nowrap text-foreground">
            {t("calendar.year", "Năm")}
          </span>
          <Combobox
            value={String(currentYear)}
            onValueChange={handleYearSelect}
          >
            <ComboboxInput className="w-24 [appearance:textfield] border-none bg-transparent text-sm font-bold text-foreground focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
            <ComboboxContent>
              <ComboboxList>
                {years.map((y) => (
                  <ComboboxItem key={y} value={String(y)}>
                    {y}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
    </div>
  )
}
