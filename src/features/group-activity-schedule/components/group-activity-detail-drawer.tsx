"use client"

import { CalendarClock, MapPin, UserRound, UsersRound } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import type {
  GroupEvent,
  GroupMember,
  Venue,
} from "@/features/group-activity-schedule/group-activity-schedule.types"
import {
  formatDateTime,
  getActivityTypeBadgeClass,
  getActivityTypeLabel,
  getMemberById,
  getStatusBadgeClass,
  getStatusLabel,
  getVenueById,
} from "@/features/group-activity-schedule/group-activity-schedule.utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface GroupActivityDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: GroupEvent | null
  members: GroupMember[]
  venues: Venue[]
}

export function GroupActivityDetailDrawer({
  open,
  onOpenChange,
  event,
  members,
  venues,
}: GroupActivityDetailDrawerProps) {
  const isMobile = useIsMobile()

  if (!event) {
    return null
  }

  const venue = getVenueById(venues, event.venueId)
  const creator = getMemberById(members, event.createdById)
  const updatedBy = getMemberById(members, event.updatedById)
  const participants = event.participantIds
    .map((id) => getMemberById(members, id))
    .filter((member): member is GroupMember => Boolean(member))

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="max-h-screen lg:max-w-xl">
        <DrawerHeader>
          <DrawerTitle>{event.title}</DrawerTitle>
          <DrawerDescription>
            Xem đầy đủ thông tin sự kiện và danh sách thành viên tham gia.
          </DrawerDescription>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={getActivityTypeBadgeClass(event.activityType)}
            >
              {getActivityTypeLabel(event.activityType)}
            </Badge>
            <Badge
              variant="outline"
              className={getStatusBadgeClass(event.status)}
            >
              {getStatusLabel(event.status)}
            </Badge>
            <Badge variant="secondary">Nhóm: {event.groupName}</Badge>
          </div>
        </DrawerHeader>

        <ScrollArea className="h-[calc(100vh-9rem)] px-4 pb-6">
          <div className="space-y-6">
            <div className="space-y-3 rounded-lg border p-4">
              <p className="flex items-start gap-2 text-sm">
                <CalendarClock className="mt-0.5 size-4 text-muted-foreground" />
                <span>
                  {formatDateTime(event.startAt)} -{" "}
                  {formatDateTime(event.endAt)}
                </span>
              </p>
              <p className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                <span>{venue?.name ?? "Không rõ địa điểm"}</span>
              </p>
              <p className="flex items-start gap-2 text-sm">
                <UserRound className="mt-0.5 size-4 text-muted-foreground" />
                <span>Người tạo: {creator?.name ?? "Không rõ"}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Nhóm sở hữu:{" "}
                <span className="font-medium text-foreground">
                  {event.groupName}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UsersRound className="size-4 text-muted-foreground" />
                <h4 className="font-semibold">Thành viên tham gia (mock)</h4>
              </div>

              <div className="space-y-2">
                {participants.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback>{member.avatarFallback}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.level}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {member.phone}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
              <p>
                Thời gian tạo:{" "}
                <span className="font-medium">
                  {formatDateTime(event.createdAt)}
                </span>
              </p>
              <p>
                Cập nhật cuối:{" "}
                <span className="font-medium">
                  {formatDateTime(event.updatedAt)}
                </span>
              </p>
              <p>
                Người cập nhật cuối:{" "}
                <span className="font-medium">
                  {updatedBy?.name ?? "Không rõ"}
                </span>
              </p>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
