"use client"

import { useRouter } from "next/navigation"
import React from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ProgressBar from "@/features/socials/components/social-listing/progress-bar"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { publishSocialAction } from "../../actions/social-form-actions"
import type { SocialDetail, User as Host } from "../../types/social"

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
  isLeaving,
}: {
  social: SocialDetail
  onJoin: () => void
  onLeave: () => void
  isLeaving?: boolean
}) {
  const { t } = useSocialsTranslation()
  const router = useRouter()
  const [isPublishing, setIsPublishing] = React.useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await publishSocialAction(social.id)
      toast.success(
        t("sidebar.publishSuccess", {
          defaultValue: "Social published successfully",
        })
      )
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish")
    } finally {
      setIsPublishing(false)
    }
  }

  const host: Host = social.creator

  if (!social) {
    return (
      <Card className="sticky top-16 h-fit p-0">
        <CardContent className="space-y-5 p-6">
          <p className="text-sm text-muted-foreground">{t("sidebar.noData")}</p>
        </CardContent>
      </Card>
    )
  }
  const isParticipant = false

  return (
    <Card className="sticky top-16 h-fit p-0">
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
              <AvatarImage src={host.avatarUrl ?? undefined} alt={host.name} />
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

        {social.isHost && social.status == "DRAFT" && (
          <Button
            className="w-full"
            size="lg"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing
              ? t("sidebar.publishing", { defaultValue: "Publishing..." })
              : t("sidebar.publishSocial")}
          </Button>
        )}

        {!isParticipant && social.status === "PUBLISHED" && (
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

        {isParticipant && (
          <Button
            className="w-full border-red-500 bg-red-500/10 text-red-600 hover:bg-red-500/20"
            size="lg"
            variant="outline"
            onClick={onLeave}
            disabled={isLeaving}
          >
            {isLeaving
              ? t("sidebar.leaving", { defaultValue: "Leaving..." })
              : t("sidebar.leaveSocial")}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
