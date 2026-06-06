"use client"

import { format } from "date-fns"
import { UserX } from "lucide-react"

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
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type { SocialParticipant } from "../../types/social"
import { getParticipantStatusLabel } from "../../utils"

export default function SocialParticipantsTab({
  participants,
}: {
  participants: SocialParticipant[]
}) {
  const { t } = useSocialsTranslation()

  return (
    <Card className="sticky top-6 h-fit p-0">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-lg font-semibold">{t("detail.participants")}</h2>
        {!participants || participants.length === 0 ? (
          <Empty className="my-6 border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserX className="size-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>{t("detail.noParticipants")}</EmptyTitle>
              <EmptyDescription>
                {t("detail.noParticipantsDescription", {
                  defaultValue: "No one has joined this social yet.",
                })}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="mt-4 space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-2xl border border-border/40 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={participant.user.avatarUrl ?? undefined}
                      alt={participant.user.name}
                    />
                    <AvatarFallback>
                      {participant.user.name
                        ? participant.user.name.slice(0, 1)
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {participant.user.name
                        ? participant.user.name
                        : "Unknown User"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        className={
                          participant.status === "CONFIRMED"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                            : "border-border bg-muted text-muted-foreground"
                        }
                        variant="outline"
                      >
                        {getParticipantStatusLabel(participant.status, t)}
                      </Badge>
                      {/* {participant.user.selfRating !== null && (
                        <Badge variant="outline">
                          {t("common.level")} {participant.user.selfRating}
                        </Badge>
                      )} */}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("detail.joinedOn", {
                    date: format(new Date(participant.joinedAt), "MMM d"),
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
