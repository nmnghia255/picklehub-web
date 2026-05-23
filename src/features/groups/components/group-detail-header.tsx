import { Badge } from "@/components/ui/badge"

import { getArchivedGroupLabel, isArchivedGroup } from "../utils/group-status"

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
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="text-3xl font-bold">{groupName}</h1>
        {archived && (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            {getArchivedGroupLabel()}
          </Badge>
        )}
      </div>
    </div>
  )
}
