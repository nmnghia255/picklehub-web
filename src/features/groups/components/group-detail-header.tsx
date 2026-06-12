import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import { getArchivedGroupLabel, isArchivedGroup } from "../utils/group-status"

interface GroupDetailHeaderProps {
  groupName: string
  groupStatus?: string | null
  avatarUrl?: string | null
}

export function GroupDetailHeader({
  groupName,
  groupStatus,
  avatarUrl,
}: GroupDetailHeaderProps) {
  const archived = isArchivedGroup(groupStatus)
  const initial = groupName.trim().slice(0, 1).toUpperCase() || "G"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 items-start gap-4">
        <Avatar size="lg" className="mt-1 bg-muted">
          <AvatarImage src={avatarUrl ?? ""} alt={groupName} />
          <AvatarFallback className="bg-muted text-base font-semibold text-foreground">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="min-w-0 text-3xl font-bold tracking-tight wrap-break-word">
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
