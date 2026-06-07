"use client"

import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { listSocialParticipantsAction } from "@/features/socials/actions/social-participant-actions"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import type { PlaySessionParticipant } from "../../types/play-session"
import type { User } from "../../types/social"
import { getParticipantStatusLabel } from "../../utils"

interface SessionParticipants extends Omit<PlaySessionParticipant, "user"> {
  user?: User
  isHost?: boolean
}

export default function PlaySessionParticipants({
  participants,
  socialId,
}: {
  participants: Array<PlaySessionParticipant>
  socialId: string
}) {
  const { t } = useSocialsTranslation()

  const { data: socialParticipants = [] } = useQuery({
    queryKey: ["socialParticipants", socialId],
    queryFn: () => listSocialParticipantsAction(socialId),
    enabled: !!socialId,
  })

  const sessionParticipants: SessionParticipants[] = participants.map(
    (participant) => {
      const sp = socialParticipants.find(
        (sp) => sp.userId === participant.userId
      )
      return {
        ...participant,
        user: sp?.user,
        isHost: sp?.isHost,
      }
    }
  )

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("detail.participants")}</h2>
      {!participants || participants.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          {t("detail.noParticipants")}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {sessionParticipants.map((participant) => {
            return (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-2xl border border-border/60 p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={participant.user?.avatarUrl ?? undefined}
                      alt={
                        participant.isGuest
                          ? participant.guestName || "Guest"
                          : participant.user?.name || "Unknown"
                      }
                    />
                    <AvatarFallback>
                      {(participant.isGuest
                        ? participant.guestName || "Guest"
                        : participant.user?.name || "Unknown"
                      ).slice(0, 1) ?? "Host"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="flex items-center text-sm font-medium">
                      {participant.isGuest
                        ? participant.guestName || "Guest"
                        : participant.user?.name || "Unknown"}
                      {participant.isHost && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          Host
                        </Badge>
                      )}
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
                      {participant.skillLevel && (
                        <Badge variant="outline">
                          {t("common.level")} {participant.skillLevel}
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
            )
          })}
        </div>
      )}
    </div>
  )
}
