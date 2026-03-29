import { CalendarDays, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Group } from "@/features/groups/types"

interface GroupOverviewCardProps {
  group: Group
}

export function GroupOverviewCard({ group }: GroupOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin nhóm</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {group.description && (
          <p className="text-sm text-muted-foreground">{group.description}</p>
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
