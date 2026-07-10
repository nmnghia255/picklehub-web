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
import type { SportCenter } from "@/features/sport-center/types/sport-center"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

// import type { SportCenter } from "@/features/sport-center-management/api/sport-center-service"
import type { RevenueFilters } from "../store/revenue-store"
import type { RevenueMethod, RevenueStatus } from "../types"

const PRESETS = [
  { key: "7d", labelKey: "revenue.filters.7d" },
  { key: "30d", labelKey: "revenue.filters.30d" },
  { key: "this-month", labelKey: "revenue.filters.this-month" },
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
  const { t } = useSportCenterManagementTranslation()
  const selectedCenterLabel = (() => {
    if (filters.centerIds.length === 0) return t("revenue.filters.allCenters")
    if (filters.centerIds.length === 1) {
      const center = centers.find((item) => item.id === filters.centerIds[0])
      return center?.name ?? t("revenue.filters.singleCenter")
    }
    return t("revenue.filters.multipleCenters", {
      count: filters.centerIds.length,
    })
  })()

  return (
    <section className="space-y-4 rounded-3xl border bg-card/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Filter className="size-4" />
        <span>{t("revenue.filters.title")}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.key}
            variant="secondary"
            size="sm"
            onClick={() => onPreset(preset.key)}
          >
            {t(preset.labelKey)}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={onReset}>
          {t("revenue.filters.reset")}
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("revenue.filters.fromDate")}
          </p>
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
          <p className="text-xs font-medium text-muted-foreground">
            {t("revenue.filters.toDate")}
          </p>
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
          <p className="text-xs font-medium text-muted-foreground">
            {t("revenue.filters.center")}
          </p>
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
                {t("revenue.filters.allCenters")}
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {centers.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {t("revenue.filters.noCenters")}
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
                        {center.address ?? t("revenue.filters.noAddress")}
                      </span>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {filters.centerIds.length > 1 ? (
            <p className="text-xs text-muted-foreground">
              {t("revenue.filters.multiCenterNote")}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("revenue.filters.status")}
          </p>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onStatusChange(value as RevenueStatus | "all")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("common.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="PENDING_REVIEW">
                {t("revenue.status.pendingReview")}
              </SelectItem>
              <SelectItem value="SETTLED">
                {t("revenue.status.settled")}
              </SelectItem>
              <SelectItem value="REJECTED">
                {t("revenue.status.rejected")}
              </SelectItem>
              <SelectItem value="VOIDED">
                {t("revenue.status.voided")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("revenue.filters.method")}
          </p>
          <Select
            value={filters.method}
            onValueChange={(value) =>
              onMethodChange(value as RevenueMethod | "all")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("common.all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="BANK_TRANSFER">
                {t("revenue.method.bankTransfer")}
              </SelectItem>
              <SelectItem value="CASH">{t("revenue.method.cash")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("revenue.filters.show")}
          </p>
          <Select
            value={String(filters.limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={t("revenue.filters.limitPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">{t("revenue.filters.limit20")}</SelectItem>
              <SelectItem value="50">{t("revenue.filters.limit50")}</SelectItem>
              <SelectItem value="100">
                {t("revenue.filters.limit100")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  )
}
