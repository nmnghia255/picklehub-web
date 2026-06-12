"use client"

import { useQuery } from "@tanstack/react-query"
import { CalendarDays, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getGroupClient,
  groupQueryKeys,
  useSyncGroupData,
} from "@/features/groups/api/groups-client"
import type { Group } from "@/features/groups/types"

import { getArchivedGroupLabel, isArchivedGroup } from "../utils/group-status"

export function GroupOverviewCard({
  groupId,
  initialData,
}: {
  groupId: string
  initialData: Group
}) {
  const queryKey = groupQueryKeys.detail(groupId)
  useSyncGroupData(queryKey, initialData)

  const { data: group } = useQuery({
    queryKey,
    queryFn: () => getGroupClient(groupId),
    initialData,
  })

  const archived = isArchivedGroup(group.status)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Thông tin nhóm</CardTitle>
          {archived && (
            <Badge
              variant="secondary"
              className="bg-muted text-muted-foreground"
            >
              {getArchivedGroupLabel()}
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
            Nhóm đã được lưu trữ và không còn hoạt động bình thường.
          </p>
        )}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-4" />
          <span>{group.memberCount} thành viên</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          <span>
            Ngày tạo:{" "}
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
