"use client"

import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSportCenterStore } from "@/features/sport-center/stores/sport-center-store"

export function FilterSidebar() {
  const favoriteFilter = useSportCenterStore((state) => state.favoriteFilter)
  const setFavoriteFilter = useSportCenterStore(
    (state) => state.setFavoriteFilter
  )
  return (
    <aside className="lg:sticky lg:top-6">
      <Card className="gap-4 p-4">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Bộ lọc
        </h2>

        <div className="space-y-2">
          <p className="text-sm font-medium">Yêu thích</p>
          <Select value={favoriteFilter} onValueChange={setFavoriteFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Yêu thích" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="favorite">Chỉ sân yêu thích</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </aside>
  )
}
