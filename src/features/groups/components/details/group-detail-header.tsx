"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import {
  groupQueryKeys,
  useGroupDetail,
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
  actions?: React.ReactNode
}

function getGroupInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function GroupDetailHeader({
  groupId,
  initialData,
  actions,
}: GroupDetailHeaderProps) {
  const queryKey = groupQueryKeys.detail(groupId)
  useSyncGroupData(queryKey, initialData)

  const { data } = useGroupDetail(groupId, initialData)

  const groupName = data?.name || initialData.name
  const groupStatus = data?.status || initialData.status
  const avatarUrl = data?.avatarUrl || initialData.avatarUrl

  const archived = isArchivedGroup(groupStatus)
  const coverSrc = avatarUrl || "/group-default.jpeg"

  return (
    <div className="flex flex-col gap-4">
      {/* Banner Cover Header */}
      <div className="relative h-44 w-full overflow-hidden rounded-xl bg-slate-900 shadow-sm sm:h-56 md:h-64">
        <img
          src={coverSrc}
          alt={groupName}
          className="h-full w-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/15 to-transparent" />
      </div>

      {/* Avatar & Title Row */}
      <div className="relative px-2 pt-0 sm:px-4">
        <div className="mb-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="flex min-w-60 flex-1 items-end gap-4">
            <Avatar className="-mt-12 size-20 shrink-0 border-4 border-background shadow-lg sm:size-24 md:-mt-16 md:size-28">
              <AvatarFallback className="bg-emerald-100 text-2xl font-extrabold text-emerald-800 sm:text-3xl md:text-4xl dark:bg-emerald-950 dark:text-emerald-300">
                {getGroupInitials(groupName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-1 pb-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1 className="min-w-0 text-2xl font-bold tracking-tight wrap-break-word text-foreground sm:text-3xl md:text-4xl">
                  {groupName}
                </h1>
                {archived && (
                  <Badge
                    variant="outline"
                    className="border-rose-200 bg-rose-100 font-semibold text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-400"
                  >
                    {getArchivedGroupLabel()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2 pb-1">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
