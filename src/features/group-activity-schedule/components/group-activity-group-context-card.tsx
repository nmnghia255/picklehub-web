"use client"

import { Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { GroupActivityGroup } from "@/features/group-activity-schedule/group-activity-schedule.types"

interface GroupActivityGroupContextCardProps {
  group: GroupActivityGroup
}

export function GroupActivityGroupContextCard({
  group,
}: GroupActivityGroupContextCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <Avatar className="size-12">
            <AvatarFallback>{group.avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">
                {group.name}
              </h2>
              <Badge variant="secondary" className="gap-1">
                <Users className="size-3.5" />
                {group.memberCount} thành viên
              </Badge>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {group.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
