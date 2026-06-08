import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  ActivityTypeFilter,
  PeriodFilter,
} from "@/features/group-activity-schedule/group-activity-schedule.types"

interface GroupActivityToolbarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  period: PeriodFilter
  onPeriodChange: (value: PeriodFilter) => void
  activityType: ActivityTypeFilter
  onActivityTypeChange: (value: ActivityTypeFilter) => void
  onCreate: () => void
}

export function GroupActivityToolbar({
  keyword,
  onKeywordChange,
  period,
  onPeriodChange,
  activityType,
  onActivityTypeChange,
  onCreate,
}: GroupActivityToolbarProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Button onClick={onCreate} className="w-full lg:w-auto">
          Tạo hoạt động
        </Button>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <Select
            value={activityType}
            onValueChange={(value) =>
              onActivityTypeChange(value as ActivityTypeFilter)
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Loại hoạt động" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="PRACTICE">Tập luyện</SelectItem>
              <SelectItem value="MEETUP">Giao lưu (Meetup)</SelectItem>
              <SelectItem value="INTERNAL_MATCH">Thi đấu nội bộ</SelectItem>
              <SelectItem value="MEETING">Họp mặt</SelectItem>
              <SelectItem value="OTHER">Khác</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={period}
            onValueChange={(value) => onPeriodChange(value as PeriodFilter)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full sm:min-w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              className="pl-9"
              placeholder="Tìm hoạt động theo tên hoặc địa điểm"
              aria-label="Tìm hoạt động"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
