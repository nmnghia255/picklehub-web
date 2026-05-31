import { FilterX, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { CustomerSportCenterSelector } from "./customer-sport-center-selector"

interface CustomerManagementFiltersProps {
  keyword: string
  hasActiveFilters: boolean
  onKeywordChange: (value: string) => void
  onResetFilters: () => void
  onRefreshCustomers: () => void
}

export function CustomerManagementFilters({
  keyword,
  hasActiveFilters,
  onKeywordChange,
  onResetFilters,
  onRefreshCustomers,
}: CustomerManagementFiltersProps) {
  return (
    <div className="sticky top-4 z-30 -mx-1">
      <Card className="border bg-background/95 shadow-lg shadow-slate-950/5 backdrop-blur supports-backdrop-filter:bg-background/85">
        <CardContent className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
          <div className="relative min-w-55 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="Tìm theo tên, email hoặc số điện thoại"
              className="pl-9"
            />
          </div>

          <div className="w-full sm:w-auto">
            <CustomerSportCenterSelector />
          </div>

          <div className="ml-auto flex">
            <Button variant="outline" onClick={onResetFilters}>
              <FilterX className="size-4" />
              <span className="ml-2">Xóa bộ lọc</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CustomerManagementFilters
