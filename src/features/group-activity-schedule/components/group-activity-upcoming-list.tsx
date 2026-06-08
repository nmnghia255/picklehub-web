import { Edit, Eye, Trash2, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { GroupActivity } from "@/features/group-activity-schedule/group-activity-schedule.types"
import {
  formatDateTime,
  getActivityTypeBadgeClass,
  getActivityTypeLabel,
  getStatusBadgeClass,
  getStatusLabel,
  sortEventsByStart,
} from "@/features/group-activity-schedule/group-activity-schedule.utils"

interface GroupActivityUpcomingListProps {
  events: GroupActivity[]
  onOpenDetail: (event: GroupActivity) => void
  onEdit: (event: GroupActivity) => void
  onDelete: (activityId: string) => void
}

export function GroupActivityUpcomingList({
  events,
  onOpenDetail,
  onEdit,
  onDelete,
}: GroupActivityUpcomingListProps) {
  const upcomingEvents = sortEventsByStart(events)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách hoạt động sắp tới</CardTitle>
        <CardDescription>
          Theo dõi các hoạt động social, buổi chơi và meetup trong nhóm.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {upcomingEvents.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Chưa có hoạt động phù hợp</EmptyTitle>
              <EmptyDescription>
                Thử đổi bộ lọc thời gian hoặc từ khóa để xem thêm dữ liệu.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="hidden rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hoạt động</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Địa điểm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingEvents.map((event) => {
                    return (
                      <TableRow key={event.id}>
                        <TableCell className="space-y-1">
                          <p className="font-medium">{event.title}</p>
                          <Badge
                            variant="outline"
                            className={getActivityTypeBadgeClass(
                              event.activityType
                            )}
                          >
                            {getActivityTypeLabel(event.activityType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(event.startAt)}
                        </TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClass(event.status)}
                          >
                            {getStatusLabel(event.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-2 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenDetail(event)}
                          >
                            <Eye className="size-4" />
                            Xem
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(event)}
                          >
                            <Edit className="size-4" />
                            Sửa
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(event.id)}
                          >
                            <Trash2 className="size-4" />
                            Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 md:hidden">
              {upcomingEvents.map((event) => {
                return (
                  <div key={event.id} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(event.startAt)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getActivityTypeBadgeClass(
                          event.activityType
                        )}
                      >
                        {getActivityTypeLabel(event.activityType)}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenDetail(event)}
                      >
                        <Eye className="size-4" />
                        Chi tiết
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(event)}
                      >
                        <Edit className="size-4" />
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(event.id)}
                      >
                        <Trash2 className="size-4" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
