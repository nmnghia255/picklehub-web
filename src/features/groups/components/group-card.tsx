import { Users } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Group } from "@/features/groups/types"

import { getArchivedGroupLabel, isArchivedGroup } from "../utils/group-status"

type Props = {
  group: Group
  actionLabel: string
  showRole?: boolean
}

function formatRole(role: string | null | undefined) {
  switch (role) {
    case "owner":
      return "Trưởng nhóm"
    case "admin":
      return "Quản trị viên"
    case "member":
      return "Thành viên"
    default:
      return role ?? "..."
  }
}

function getGroupInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function GroupCard({ group, actionLabel, showRole = false }: Props) {
  const archived = isArchivedGroup(group.status)

  return (
    <Card key={group.id}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar>
              <AvatarImage
                src={group.avatarUrl ?? undefined}
                alt={group.name}
              />
              <AvatarFallback>{getGroupInitials(group.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="line-clamp-1 text-lg">{group.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {group.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {group.description}
          </p>
        )}
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="size-4" />
            <span>{group.memberCount} thành viên</span>
          </div>
          <div className="flex items-center gap-2">
            {showRole ? (
              <Badge variant="secondary" className="capitalize">
                {formatRole(group.role)}
              </Badge>
            ) : null}
            {archived ? (
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground"
              >
                {getArchivedGroupLabel()}
              </Badge>
            ) : null}
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/groups/${group.id}`}>{actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
