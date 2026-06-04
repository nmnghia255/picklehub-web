"use client"

import { format } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="p-0">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-lg font-semibold">{t("detail.participants")}</h2>
        {!participants || participants.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            {t("detail.noParticipants")}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-2xl border border-border/60 p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={participant.avatarUrl ?? undefined}
                      alt={participant.name}
                    />
                    <AvatarFallback>
                      {participant.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{participant.name}</p>
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
                      {participant.selfRating !== null && (
                        <Badge variant="outline">
                          {t("common.level")}{" "}
                          {participant.selfRating.toFixed(1)}
                        </Badge>
                      )}
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
