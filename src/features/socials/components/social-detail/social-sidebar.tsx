"use client"

import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ProgressBar from "@/features/socials/components/social-listing/progress-bar"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import type { Host, ListSocialResponse as Social } from "../../types/social"

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  )
}

export default function SocialSidebar({
  social,
  onJoin,
  onLeave,
}: {
  social: Social
  onJoin: () => void
  onLeave: () => void
}) {
  const { t } = useSocialsTranslation()
  const hostId = social.organizers[0] || social.creatorId
  const host: Host = {
    id: hostId.userId,
    name: "Sarah Martinez",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  }

  return (
    <Card className="sticky top-6 h-fit p-0">
      <CardContent className="space-y-5 p-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {t("sidebar.participants")}
          </p>
          <h2 className="mt-1 text-3xl font-semibold">
            {social.joinedCount} / {social.maxSlots}
          </h2>
          <div className="mt-3 space-y-2">
            <ProgressBar value={(social.joinedCount / social.maxSlots) * 100} />
            <p className="text-xs text-muted-foreground">
              {t("sidebar.spotsRemaining", {
                count: social.maxSlots - social.joinedCount,
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
              <AvatarFallback>{(host.name ?? "H").slice(0, 1)}</AvatarFallback>
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

        {/* {social.totalExpense && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("sidebar.payment")}
              </p>
              <div className="text-3xl font-semibold text-primary">
                {formatCurrencyVnd(social.totalExpense)}
              </div>
            </div>
          </>
        )} */}

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
