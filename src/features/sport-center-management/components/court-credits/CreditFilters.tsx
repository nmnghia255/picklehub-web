"use client"

import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCourtCreditsTranslation } from "@/i18n/use-court-credits-translation"

import type {
  CancellationReason,
  CourtOption,
} from "../../credit-management/court-credits-data"

export function CreditFilters({
  search,
  cancellationReasonFilter,
  courtFilter,
  sortBy,
  courts,
  cancellationReasonOptions,
  sortOptions,
  onSearchChange,
  onCancellationReasonFilterChange,
  onCourtFilterChange,
  onSortChange,
  onReset,
}: {
  search: string
  cancellationReasonFilter: "all" | CancellationReason
  courtFilter: string
  sortBy: string
  courts: CourtOption[]
  cancellationReasonOptions: Array<{
    value: "all" | CancellationReason
    label: string
  }>
  sortOptions: Array<{ value: string; label: string }>
  onSearchChange: (value: string) => void
  onCancellationReasonFilterChange: (value: "all" | CancellationReason) => void
  onCourtFilterChange: (value: string) => void
  onSortChange: (value: string) => void
  onReset: () => void
}) {
  const { t } = useCourtCreditsTranslation()

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))]">
      <div className="relative xl:col-span-3">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("filters.searchPlaceholder")}
          className="h-10 pl-9"
        />
      </div>

      <Select
        value={cancellationReasonFilter}
        onValueChange={(value) =>
          onCancellationReasonFilterChange(value as "all" | CancellationReason)
        }
      >
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder={t("filters.reason")} />
        </SelectTrigger>
        <SelectContent>
          {cancellationReasonOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={courtFilter} onValueChange={onCourtFilterChange}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder={t("filters.court")} />
        </SelectTrigger>
        <SelectContent>
          {courts.map((court) => (
            <SelectItem key={court.value} value={court.value}>
              {court.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2 xl:col-span-1">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder={t("filters.sort")} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          aria-label={t("filters.resetFilters")}
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={onReset}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
