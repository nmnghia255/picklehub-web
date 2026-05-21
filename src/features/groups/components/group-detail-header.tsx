import { CalendarDays, Plus } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { getArchivedGroupLabel, isArchivedGroup } from "../utils/group-status"
import { ArchiveGroupDialog } from "./archive-group-dialog"
import { LeaveGroupButton } from "./group-member-actions"
import { InviteDialog } from "./invite-dialog"

interface GroupDetailHeaderProps {
  groupId: string
  groupName: string
  isOwner: boolean
  groupStatus?: string | null
}

export function GroupDetailHeader({
  groupId,
  groupName,
  isOwner,
  groupStatus,
}: GroupDetailHeaderProps) {
  const archived = isArchivedGroup(groupStatus)

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="text-3xl font-bold">{groupName}</h1>
        {archived && (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            {getArchivedGroupLabel()}
          </Badge>
        )}
      </div>
      <div className="flex gap-2">
        <Link href={`/groups/${groupId}/activity-schedule`}>
          <Button variant="outline" size="sm">
            <CalendarDays className="mr-2 size-4" />
            Lịch nhóm
          </Button>
        </Link>
        {archived ? (
          <Button
            variant="default"
            size="sm"
            disabled
            title="Nhóm đã được lưu trữ"
          >
            <Plus className="mr-2 size-4" />
            Tạo buổi chơi
          </Button>
        ) : (
          <Link href={`/groups/${groupId}/create-play-session`}>
            <Button variant="default" size="sm">
              <Plus className="mr-2 size-4" />
              Tạo buổi chơi
            </Button>
          </Link>
        )}
        {!isOwner && <LeaveGroupButton groupId={groupId} />}
        {isOwner && !archived && <InviteDialog groupId={groupId} />}
        {isOwner && !archived && (
          <ArchiveGroupDialog groupId={groupId} groupName={groupName} />
        )}
      </div>
    </div>
  )
}
