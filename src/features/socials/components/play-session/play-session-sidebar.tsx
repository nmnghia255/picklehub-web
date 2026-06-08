"use client"

import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import type { PlaySession } from "../../types/play-session"
import type { SocialDetail } from "../../types/social"
import ProgressBar from "./progress-bar"

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  )
}

export default function PlaySessionSidebar({
  session,
  social,
  onJoin,
  onLeave,
}: {
  session: PlaySession
  social: SocialDetail
  onJoin: () => void
  onLeave: () => void
}) {
  const { t } = useSocialsTranslation()
  const host = social.creator
  const isParticipant =
    social.myParticipantInfo?.joinedSessionIds?.includes(session.id as never) ??
    false

  return (
    <Card className="sticky top-6 h-fit p-0">
      <CardContent className="space-y-5 p-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {t("sidebar.participants")}
          </p>
          <h2 className="mt-1 text-3xl font-semibold">
            {session.joinedCount} / {social.maxSlots}
          </h2>
          <div className="mt-3 space-y-2">
            <ProgressBar
              value={(session.joinedCount / social.maxSlots) * 100}
            />
            <p className="text-xs text-muted-foreground">
              {t("sidebar.spotsRemaining", {
                count: social.maxSlots - session.joinedCount,
              })}
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm text-muted-foreground">
            {t("sidebar.hostedBy")}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Avatar className="size-11">
              <AvatarImage
                src={host.avatarUrl ?? undefined}
                alt={host.name ?? "Host"}
              />
              <AvatarFallback>{host.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{host.name}</p>
              <p className="text-xs text-muted-foreground">
                {social.hostRole === "HOST_AND_PLAY"
                  ? t("sidebar.hostRoleHostAndPlay")
                  : t("sidebar.hostRoleHostOnly")}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("sidebar.settings")}
          </p>
          <div className="space-y-2 text-sm">
            <SettingRow
              label={t("sidebar.autoApprove")}
              value={
                social.autoApproveJoinRequests
                  ? t("sidebar.autoApproveEnabled")
                  : t("sidebar.manualApprovalRequired")
              }
            />

            <SettingRow
              label={t("sidebar.cancellationPolicy")}
              value={
                social.cancellationFreezeHours != null
                  ? `${t("common.hours", {
                      count: social.cancellationFreezeHours,
                    })} ${t("common.beforeEvent")}`
                  : t("common.na", { defaultValue: "N/A" })
              }
            />
            <SettingRow
              label={t("sidebar.visibility")}
              value={
                social.isPrivate ? t("badges.private") : t("badges.public")
              }
            />
          </div>
        </div>

        {typeof session.sessionFee === "number" && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("sidebar.payment")}
              </p>
              <div className="text-xl font-semibold text-primary">
                {session.sessionFee > 0
                  ? formatCurrencyVnd(session.sessionFee)
                  : t("form.freeEvent")}
              </div>
            </div>
          </>
        )}

        {!isParticipant && social.status === "PUBLISHED" && (
          <Button
            className="w-full"
            size="lg"
            disabled={!social.hasAvailableSlots}
            onClick={onJoin}
          >
            {social.hasAvailableSlots
              ? t("sidebar.joinSession")
              : t("sidebar.full")}
          </Button>
        )}

        {isParticipant && (
          <Button
            className="w-full"
            size="lg"
            variant="destructive"
            onClick={onLeave}
          >
            {t("sidebar.leaveSession")}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
