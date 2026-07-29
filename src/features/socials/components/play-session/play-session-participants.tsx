"use client"

import { format } from "date-fns"
import { Clock, UserCheck, UserX } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isConfirmedLikeSocialParticipantStatus } from "@/features/socials/utils"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type { PlaySessionParticipant } from "../../types/play-session"
import { getParticipantStatusLabel } from "../../utils"

export default function PlaySessionParticipants({
  participants = [],
}: {
  participants: Array<PlaySessionParticipant>
}) {
  const { t } = useSocialsTranslation()

  const confirmedParticipants = (participants || []).filter(
    (p) =>
      p.status === "CONFIRMED" ||
      p.status === "ACCEPTED" ||
      isConfirmedLikeSocialParticipantStatus(p.status)
  )

  const waitingParticipants = (participants || []).filter(
    (p) => p.status === "WAITLISTED"
  )

  const renderParticipantRow = (participant: PlaySessionParticipant) => {
    const name = participant.isHost
      ? participant.guestName || t("common.guest")
      : participant.user?.name || t("common.unknownUser")

    return (
      <Card
        key={participant.id}
        className="p-2 transition-colors hover:bg-muted/10"
      >
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage
                src={participant.user?.avatarUrl ?? undefined}
                alt={name}
              />
              <AvatarFallback>{name.slice(0, 1) || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="flex items-center text-sm font-medium">
                {name}
                {participant.isHost && (
                  <Badge variant="outline" className="ml-2 text-[10px]">
                    {t("common.host")}
                  </Badge>
                )}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge
                  className={
                    isConfirmedLikeSocialParticipantStatus(participant.status)
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                      : participant.status === "WAITLISTED"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                        : "border-border bg-muted text-muted-foreground"
                  }
                  variant="outline"
                >
                  {getParticipantStatusLabel(participant.status, t)}
                </Badge>
                {participant.status === "WAITLISTED" && (
                  <Badge
                    variant="outline"
                    className="border-amber-500/40 text-amber-700 dark:text-amber-300"
                  >
                    Phí 0 VNĐ
                  </Badge>
                )}
                {participant.skillLevel && (
                  <Badge variant="outline">
                    {t("common.level")} {participant.skillLevel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {participant.joinedAt && (
            <p
              className="text-xs text-muted-foreground"
              suppressHydrationWarning
            >
              {t("detail.joinedOn", {
                date: format(new Date(participant.joinedAt), "dd/MM"),
              })}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="confirmed" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto">
          <TabsTrigger value="confirmed" className="gap-1.5">
            <UserCheck className="size-4 text-emerald-600" />
            <span>{t("detail.participants")}</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {confirmedParticipants.length}
            </span>
          </TabsTrigger>

          <TabsTrigger value="waiting" className="gap-1.5">
            <Clock className="size-4 text-amber-600" />
            <span>Danh sách chờ</span>
            {waitingParticipants.length > 0 ? (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                {waitingParticipants.length}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">(0)</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="confirmed" className="space-y-3 pt-2">
          {confirmedParticipants.length === 0 ? (
            <Empty className="my-6 border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UserX className="size-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>{t("detail.noParticipants")}</EmptyTitle>
                <EmptyDescription>
                  {t("detail.noParticipantsDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-3">
              {confirmedParticipants.map(renderParticipantRow)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="waiting" className="space-y-3 pt-2">
          {waitingParticipants.length === 0 ? (
            <Empty className="my-6 border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UserX className="size-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>Không có ai trong hàng chờ ca này</EmptyTitle>
                <EmptyDescription>
                  Các VĐV đăng ký sau khi hết slot hoặc hết deadline sẽ được
                  chuyển vào hàng chờ.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-3">
              {waitingParticipants.map(renderParticipantRow)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
