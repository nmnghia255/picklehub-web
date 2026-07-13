"use client"

import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import type {
  InventoryKind,
  StatusFilter,
} from "../store/services-products-store"
import { PRODUCT_TYPE_OPTIONS, SERVICE_TYPE_OPTIONS } from "../types"

export function InventoryFilters({
  kind,
  search,
  type,
  status,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onCreate,
}: {
  kind: InventoryKind
  search: string
  type: string
  status: StatusFilter
  onSearchChange: (value: string) => void
  onTypeChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  onCreate: () => void
}) {
  const { t } = useSportCenterManagementTranslation()
  const typeOptions =
    kind === "service" ? SERVICE_TYPE_OPTIONS : PRODUCT_TYPE_OPTIONS

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          {t("inventory.filters.searchTitle")}
        </p>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              kind === "service"
                ? t("inventory.filters.searchServicePlaceholder")
                : t("inventory.filters.searchProductPlaceholder")
            }
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          {t("inventory.filters.typeTitle")}
        </p>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder={t("inventory.filters.typeAll")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("inventory.filters.typeAll")}
            </SelectItem>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          {t("inventory.filters.statusTitle")}
        </p>
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as StatusFilter)}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder={t("inventory.filters.statusAll")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("inventory.filters.statusAll")}
            </SelectItem>
            <SelectItem value="active">
              {t("inventory.filters.statusActive")}
            </SelectItem>
            <SelectItem value="inactive">
              {t("inventory.filters.statusInactive")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onCreate} className="gap-2">
        <Plus className="size-4" />
        {kind === "service"
          ? t("inventory.filters.createService")
          : t("inventory.filters.createProduct")}
      </Button>
    </div>
  )
}
