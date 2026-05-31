import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SportCenterSelector } from "@/features/sport-center-management/components/courts-management/sport-center-selector"

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
        <CardContent className="grid gap-4 p-4 sm:p-5 md:grid-cols-[220px_minmax(0,1fr)_auto] md:items-center">
          <SportCenterSelector />

          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="Tìm theo tên, email hoặc số điện thoại"
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" onClick={onResetFilters}>
                Xóa lọc
              </Button>
            )}
            <Button variant="outline" onClick={onRefreshCustomers}>
              Tải lại
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CustomerManagementFilters
