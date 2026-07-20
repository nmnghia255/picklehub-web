"use client"

import { useQuery } from "@tanstack/react-query"
import { CalendarDays, Info, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getGroupClient,
  groupQueryKeys,
  useSyncGroupData,
} from "@/features/groups/api/groups-client"
import type { Group } from "@/features/groups/types"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import { isArchivedGroup } from "../../utils/group-status"

export function GroupOverviewCard({
  groupId,
  initialData,
}: {
  groupId: string
  initialData: Group
}) {
  const { t } = useGroupsTranslation()
  const queryKey = groupQueryKeys.detail(groupId)
  useSyncGroupData(queryKey, initialData)

  const { data: group } = useQuery({
    queryKey,
    queryFn: () => getGroupClient(groupId),
    initialData,
  })

  const archived = isArchivedGroup(group.status)

  return (
    <Card className="group-feature-root">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="size-5 text-base" />
            <CardTitle>
              {t("dashboard.groupInfoTitle", "Thông tin nhóm")}
            </CardTitle>
          </div>
          {archived && (
            <Badge
              variant="outline"
              className="border-rose-200 bg-rose-100 font-semibold text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-400"
            >
              {t("archived", "Đã lưu trữ")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {group.description && (
          <p className="text-sm text-muted-foreground">{group.description}</p>
        )}
        {archived && (
          <p className="text-sm text-muted-foreground">
            {t(
              "dashboard.groupArchivedNotice",
              "Nhóm đã được lưu trữ và không còn hoạt động bình thường."
            )}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-4" />
          <span>
            {t("membersCount", "{{count}} members", {
              count: group.memberCount,
            })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          <span>
            {t("dashboard.createdAtLabel", "Ngày tạo")}:{" "}
            {new Date(group.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
