"use client"

import { useQuery } from "@tanstack/react-query"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import {
  getGroupClient,
  groupQueryKeys,
  useSyncGroupData,
} from "../../api/groups-client"
import type { Group } from "../../types"
import {
  getArchivedGroupLabel,
  isArchivedGroup,
} from "../../utils/group-status"

interface GroupDetailHeaderProps {
  groupId: string
  initialData: Group
}

export function GroupDetailHeader({
  groupId,
  initialData,
}: GroupDetailHeaderProps) {
  const queryKey = groupQueryKeys.detail(groupId)
  useSyncGroupData(queryKey, initialData)

  const { data } = useQuery({
    queryKey,
    queryFn: () => getGroupClient(groupId),
    initialData,
  })

  const groupName = data?.name || initialData.name
  const groupStatus = data?.status || initialData.status
  const avatarUrl = data?.avatarUrl || initialData.avatarUrl

  const archived = isArchivedGroup(groupStatus)
  const initial = groupName.trim().slice(0, 1).toUpperCase() || "G"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 items-start gap-4">
        <Avatar className="mt-1 size-16 bg-muted md:size-20">
          <AvatarImage src={avatarUrl ?? ""} alt={groupName} />
          <AvatarFallback className="bg-muted text-2xl font-semibold text-foreground md:text-3xl">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="min-w-0 text-3xl font-bold tracking-tight wrap-break-word text-orange-500 dark:text-orange-400">
              {groupName}
            </h1>
            {archived && (
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground"
              >
                {getArchivedGroupLabel()}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
