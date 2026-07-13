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
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

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
  const { t } = useGroupsTranslation()

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Button onClick={onCreate} className="w-full lg:w-auto">
          {t("activitySchedule.btnCreateActivity")}
        </Button>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <Select
            value={activityType}
            onValueChange={(value) =>
              onActivityTypeChange(value as ActivityTypeFilter)
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue
                placeholder={t("activitySchedule.filterActivityType")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("activitySchedule.filterAllTypes")}
              </SelectItem>
              <SelectItem value="PRACTICE">
                {t("activityTypes.PRACTICE")}
              </SelectItem>
              <SelectItem value="MEETUP">
                {t("activityTypes.MEETUP")}
              </SelectItem>
              <SelectItem value="INTERNAL_MATCH">
                {t("activityTypes.INTERNAL_MATCH")}
              </SelectItem>
              <SelectItem value="MEETING">
                {t("activityTypes.MEETING")}
              </SelectItem>
              <SelectItem value="OTHER">{t("activityTypes.OTHER")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={period}
            onValueChange={(value) => onPeriodChange(value as PeriodFilter)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={t("activitySchedule.filterTime")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">
                {t("activitySchedule.filterToday")}
              </SelectItem>
              <SelectItem value="week">
                {t("activitySchedule.filterThisWeek")}
              </SelectItem>
              <SelectItem value="month">
                {t("activitySchedule.filterThisMonth")}
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full sm:min-w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              className="pl-9"
              placeholder={t("activitySchedule.searchPlaceholder")}
              aria-label={t("activitySchedule.searchAriaLabel")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
