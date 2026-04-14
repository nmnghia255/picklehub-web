import { CalendarDays, Users } from "lucide-react"

import { ErrorSection } from "@/components/error-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getGroup } from "@/features/groups/api/groups-service"

export async function GroupOverviewCard({ groupId }: { groupId: string }) {
  const group = await getGroup(groupId).catch((error) => {
    console.error("Error loading group overview:", error)
    return null
  })

  if (!group) {
    return (
      <ErrorSection message="Đã xảy ra lỗi khi tải thông tin nhóm. Vui lòng thử lại sau." />
    )
  }

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
