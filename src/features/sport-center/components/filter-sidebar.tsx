"use client"

import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  distanceFilter: string
  setDistanceFilter: (value: string) => void
  playTimeFilter: string
  setPlayTimeFilter: (value: string) => void
  favoriteFilter: string
  setFavoriteFilter: (value: string) => void
}

export function FilterSidebar({
  distanceFilter,
  setDistanceFilter,
  playTimeFilter,
  setPlayTimeFilter,
  favoriteFilter,
  setFavoriteFilter,
}: Props) {
  return (
    <aside className="lg:sticky lg:top-6">
      <Card className="gap-4 p-4">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Bộ lọc
        </h2>

        <div className="space-y-2">
          <p className="text-sm font-medium">Khoảng cách</p>
          <Select value={distanceFilter} onValueChange={setDistanceFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Khoảng cách" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khoảng cách</SelectItem>
              <SelectItem value="< 5 km">&lt; 5 km</SelectItem>
              <SelectItem value="5 - 10 km">5 - 10 km</SelectItem>
              <SelectItem value="10 - 20 km">10 - 20 km</SelectItem>
              <SelectItem value="> 20 km">&gt; 20 km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Thời gian chơi</p>
          <Select value={playTimeFilter} onValueChange={setPlayTimeFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Thời gian chơi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thời gian chơi</SelectItem>
              <SelectItem value="morning">Sáng</SelectItem>
              <SelectItem value="afternoon">Chiều</SelectItem>
              <SelectItem value="evening">Tối</SelectItem>
              <SelectItem value="night">Đêm</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
