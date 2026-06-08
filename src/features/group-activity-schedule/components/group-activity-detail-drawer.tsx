"use client"

import { useQuery } from "@tanstack/react-query"
import { CalendarClock, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"

import { activityQueryKeys, getActivityClient } from "../api/activities-client"
import {
  formatDateTime,
  getActivityTypeBadgeClass,
  getActivityTypeLabel,
  getStatusBadgeClass,
  getStatusLabel,
} from "../group-activity-schedule.utils"

interface GroupActivityDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activityId: string
  groupId: string
}

export function GroupActivityDetailDrawer({
  open,
  onOpenChange,
  activityId,
  groupId,
}: GroupActivityDetailDrawerProps) {
  const isMobile = useIsMobile()

  const { data: activity, isLoading } = useQuery({
    queryKey: activityQueryKeys.detail(groupId, activityId),
    queryFn: () => getActivityClient(groupId, activityId),
    enabled: open && !!activityId && !!groupId,
  })

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="max-h-screen lg:max-w-xl">
        {isLoading ? (
          <div className="space-y-6 p-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        ) : activity ? (
          <>
            <DrawerHeader>
              <DrawerTitle>{activity.title}</DrawerTitle>
              <DrawerDescription>Chi tiết hoạt động nhóm.</DrawerDescription>

              <div className="mt-2 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={getActivityTypeBadgeClass(activity.activityType)}
                >
                  {getActivityTypeLabel(activity.activityType)}
                </Badge>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass(activity.status)}
                >
                  {getStatusLabel(activity.status)}
                </Badge>
              </div>
            </DrawerHeader>

            <ScrollArea className="h-[calc(100vh-9rem)] px-4 pb-6">
              <div className="space-y-6">
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="flex items-start gap-2 text-sm">
                    <CalendarClock className="mt-0.5 size-4 text-muted-foreground" />
                    <span>
                      {formatDateTime(activity.startAt)} -{" "}
                      {formatDateTime(activity.endAt)}
                    </span>
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                    <span>{activity.location || "Không rõ địa điểm"}</span>
                  </p>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {activity.description}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
                  <p>
                    Thời gian tạo:{" "}
                    <span className="font-medium">
                      {formatDateTime(activity.createdAt)}
                    </span>
                  </p>
                  <p>
                    Cập nhật cuối:{" "}
                    <span className="font-medium">
                      {formatDateTime(activity.updatedAt)}
                    </span>
                  </p>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Không tìm thấy thông tin hoạt động.
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
