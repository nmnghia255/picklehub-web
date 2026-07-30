"use client"

import { Users } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { OpenChatButton } from "@/features/chat/components/open-chat-button"
import { useMySubscriptions } from "@/features/subscriptions/hooks/use-my-subscriptions"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import {
  publishSocialAction,
  updateSocialAction,
} from "../../actions/social-form-actions"
import useSocialDetailStore from "../../stores/social-detail-store"
import type { SocialDetail, User as Host } from "../../types/social"
import {
  isConfirmedLikeSocialParticipantStatus,
  isSocialExpired,
  isSocialStarted,
} from "../../utils"

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="lg:text-md flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  )
}

export default function SocialSidebar({
  social,
  isParticipant,
  isEditable,
}: {
  social: SocialDetail
  isParticipant: boolean
  isEditable: boolean
}) {
  const { t } = useSocialsTranslation()
  const { t: tCommon } = useTranslation("common")
  const router = useRouter()
  const setJoinDialogOpen = useSocialDetailStore((s) => s.setJoinDialogOpen)
  const setLeaveDialogOpen = useSocialDetailStore((s) => s.setLeaveDialogOpen)
  const setInviteDialogOpen = useSocialDetailStore((s) => s.setInviteDialogOpen)
  const [isPublishing, setIsPublishing] = React.useState(false)
  const [isCompleting, setIsCompleting] = React.useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = React.useState(false)

  const { data: subscriptions } = useMySubscriptions()
  const hasSocialHostPlan = Boolean(
    subscriptions?.some(
      (sub) => sub.status === "ACTIVE" && sub.plan.type === "SOCIAL_HOST"
    )
  )
  const canCompleteSocial =
    Boolean(social.isHost) && hasSocialHostPlan && social.status === "PUBLISHED"

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      await updateSocialAction(social.id, { status: "COMPLETED" })
      toast.success(t("sidebar.completeSuccess"))
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("sidebar.completeError")
      )
    } finally {
      setIsCompleting(false)
    }
  }

  const handlePublishClick = () => {
    // 1. Check if there is at least one play session
    const hasPlaySessions =
      social.playSessions && social.playSessions.length > 0
    if (!hasPlaySessions) {
      toast.error(t("sidebar.publishValidation.noSessions"))
      return
    }

    // 2. Check if payment information is setup (unless it is a free event)
    const hasPaymentSetup =
      social.isFree ||
      (social.paymentBankName &&
        social.paymentAccountName &&
        social.paymentAccountNumber)
    if (!hasPaymentSetup) {
      toast.error(t("sidebar.publishValidation.noPayment"))
      return
    }

    // 3. Open the confirm dialog
    setPublishDialogOpen(true)
  }

  const handlePublish = async () => {
    setPublishDialogOpen(false)
    setIsPublishing(true)
    try {
      await publishSocialAction(social.id)
      toast.success(t("sidebar.publishSuccess"))
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("sidebar.publishError")
      )
    } finally {
      setIsPublishing(false)
    }
  }

  const host: Host = social.creator
  const canOpenChat =
    Boolean(social.isHost) ||
    isConfirmedLikeSocialParticipantStatus(social.myParticipantInfo?.status)

  if (!social) {
    return (
      <Card className="sticky top-16 h-fit p-0">
        <CardContent className="space-y-5 p-6">
          <p className="text-sm text-muted-foreground">{t("sidebar.noData")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="sticky top-16 h-fit p-0">
        <CardContent className="space-y-5 p-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {t("sidebar.hostedBy")}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarImage
                  src={host.avatarUrl ?? undefined}
                  alt={host.name}
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

          {canOpenChat && (
            <OpenChatButton
              kind="social"
              targetId={social.id}
              label={tCommon("chat.actions.openSocial")}
              variant="secondary"
              className="w-full"
            />
          )}

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
                    : t("common.na")
                }
              />
              <SettingRow
                label={t("sidebar.participants")}
                value={`${social.joinedCount}`}
              />
            </div>
          </div>

          {social.isHost &&
            social.status === "PUBLISHED" &&
            !isSocialStarted(social) && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setInviteDialogOpen(true)}
              >
                <Users className="mr-2 size-4" />
                {t("invitation.openDialog")}
              </Button>
            )}

          {isEditable && social.status == "DRAFT" && (
            <Button
              className="w-full"
              size="lg"
              onClick={handlePublishClick}
              disabled={isPublishing}
            >
              {isPublishing
                ? t("sidebar.publishing")
                : t("sidebar.publishSocial")}
            </Button>
          )}

          {canCompleteSocial && (
            <Button
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              size="lg"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              {isCompleting
                ? t("sidebar.completing")
                : t("sidebar.completeSocial")}
            </Button>
          )}

          {isParticipant && !social.isHost && (
            <Button
              className="w-full"
              size="lg"
              variant="destructive"
              onClick={() => setLeaveDialogOpen(true)}
            >
              {t("sidebar.leave")}
            </Button>
          )}

          {!isParticipant &&
            !social.isHost &&
            social.status === "PUBLISHED" &&
            !isSocialExpired(social) &&
            (social.hasAvailableSlots ? (
              <Button
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                size="lg"
                onClick={() => setJoinDialogOpen(true)}
              >
                {t("sidebar.join")}
              </Button>
            ) : (
              <Button className="w-full" size="lg" disabled>
                {t("sidebar.full")}
              </Button>
            ))}
        </CardContent>
      </Card>

      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent className="gap-2 py-4">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("sidebar.publishConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("sidebar.publishConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={isPublishing}>
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
