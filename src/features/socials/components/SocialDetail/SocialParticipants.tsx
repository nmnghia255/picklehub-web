"use client"

import { format } from "date-fns"
import React from "react"

import { Badge } from "@/components/ui/badge"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

export default function SocialParticipants({
  participants,
}: {
  participants?: Array<{
    id: string
    userId: string
    status: string
    joinedAt: string | Date
    skillLevel?: string | number | null
  }>
}) {
  const { t } = useSocialsTranslation()

  const getParticipantStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return t("participantStatus.confirmed")
      case "CANCELLED":
        return t("participantStatus.cancelled")
      case "REJECTED":
        return t("participantStatus.rejected")
      case "WAITLISTED":
        return t("participantStatus.pending")
      case "ON_HOLD":
        return t("participantStatus.pending")
      default:
        return t("participantStatus.pending")
    }
  }

  return (
    <>
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
                <div>
                  <p className="text-sm font-medium">{participant.userId}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge
                      className={
                        participant.status === "CONFIRMED"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                          : "border-border bg-muted text-muted-foreground"
                      }
                      variant="outline"
                    >
                      {getParticipantStatusLabel(participant.status)}
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
          ))}
        </div>
      )}
    </>
  )
}
