"use client"

import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ProgressBar from "@/features/socials/components/SocialListing/ProgressBar"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  )
}

export default function SocialSidebar({
  session,
  social,
  onJoin,
  onLeave,
}: {
  session: {
    joinedCount: number
    maxSlots: number
  }
  social: {
    organizers: Array<{ name: string; avatar?: string | null }>
    hostRole: string
    autoApproveJoinRequests: boolean
    cancellationFreezeHours: number
    isPrivate: boolean
    totalExpense?: number | null
    isParticipant?: boolean
    status: string
    hasAvailableSlots: boolean
  }
  onJoin: () => void
  onLeave: () => void
}) {
  const { t } = useSocialsTranslation()

  return (
    <Card className="sticky top-6 h-fit p-0">
      <CardContent className="space-y-5 p-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {t("sidebar.participants")}
          </p>
          <h2 className="mt-1 text-3xl font-semibold">
            {session.joinedCount} / {session.maxSlots}
          </h2>
          <div className="mt-3 space-y-2">
            <ProgressBar
              value={(session.joinedCount / session.maxSlots) * 100}
            />
            <p className="text-xs text-muted-foreground">
              {t("sidebar.spotsRemaining", {
                count: session.maxSlots - session.joinedCount,
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
                src={social.organizers[0]?.avatar ?? undefined}
                alt={social.organizers[0]?.name ?? "Host"}
              />
              <AvatarFallback>
                {(social.organizers[0]?.name ?? "H").slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {social.organizers[0]?.name}
              </p>
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
              value={`${t("common.hours", {
                count: social.cancellationFreezeHours,
              })} ${t("common.beforeEvent")}`}
            />
            <SettingRow
              label={t("sidebar.visibility")}
              value={
                social.isPrivate ? t("badges.private") : t("badges.public")
              }
            />
          </div>
        </div>

        {social.totalExpense && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("sidebar.payment")}
              </p>
              <div className="text-3xl font-semibold text-primary">
                ${social.totalExpense}
              </div>
            </div>
          </>
        )}

        {!social.isParticipant && social.status === "PUBLISHED" && (
          <Button
            className="w-full"
            size="lg"
            disabled={!social.hasAvailableSlots}
            onClick={onJoin}
          >
            {social.hasAvailableSlots
              ? t("sidebar.joinSocial")
              : t("sidebar.full")}
          </Button>
        )}

        {social.isParticipant && (
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={onLeave}
          >
            {t("sidebar.leaveSocial")}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
