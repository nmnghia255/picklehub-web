"use client"

import { differenceInHours } from "date-fns"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"
import { toast } from "sonner"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { joinPlaySessionAction } from "@/features/socials/actions/join-play-session"
import { leavePlaySessionAction } from "@/features/socials/actions/leave-play-session"
import { PlaySessionForm } from "@/features/socials/components/play-session/play-session-form"
import useSocialDetailStore from "@/features/socials/stores/social-detail-store"
import type { PlaySession } from "@/features/socials/types/play-session"
import type {
  SocialDetail,
  SocialParticipant,
} from "@/features/socials/types/social"
import {
  isActiveSocialParticipantStatus,
  isSocialExpired,
} from "@/features/socials/utils"
import { useMySubscriptions } from "@/features/subscriptions/hooks/use-my-subscriptions"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import SocialBookingTab from "./booking-tab/social-booking-tab"
import SocialExpenseTab from "./expense-tab/social-expense-tab"
import SocialFeedbackTab from "./feedback-tab/social-feedback-tab"
import SocialOverview from "./overview-tab/social-overview"
import SocialSessions from "./overview-tab/social-session"
import SocialParticipantsTab from "./participants-tab/social-participants-tab"
import SocialPaymentTab from "./payment-tab/social-payment-tab"
import SocialHeader from "./social-header"
import SocialHero from "./social-hero"
import SocialInviteConfirmDialog from "./social-invite-confirm-dialog"
import SocialInviteDialog from "./social-invite-dialog"
import SocialJoinDialog from "./social-join-dialog"
import SocialLeaveDialog from "./social-leave-dialog"
import SocialSidebar from "./social-sidebar"
import SocialStatisticsTab from "./statistics-tab/social-statistics-tab"

interface SocialDetailProps {
  initialSocial: SocialDetail | null
  initialParticipants: SocialParticipant[]
  initialPlaySessions: PlaySession[]
  inviteCode?: string | null
  invitationId?: string | null
}

export default function SocialDetail({
  initialSocial,
  initialParticipants,
  initialPlaySessions,
  inviteCode,
  invitationId,
}: SocialDetailProps) {
  const router = useRouter()
  const { t } = useSocialsTranslation()

  const joinDialogOpen = useSocialDetailStore((s) => s.joinDialogOpen)
  const setJoinDialogOpen = useSocialDetailStore((s) => s.setJoinDialogOpen)

  const leaveDialogOpen = useSocialDetailStore((s) => s.leaveDialogOpen)
  const setLeaveDialogOpen = useSocialDetailStore((s) => s.setLeaveDialogOpen)

  const inviteDialogOpen = useSocialDetailStore((s) => s.inviteDialogOpen)
  const setInviteDialogOpen = useSocialDetailStore((s) => s.setInviteDialogOpen)

  const playSessionModalOpen = useSocialDetailStore(
    (s) => s.playSessionModalOpen
  )
  const setPlaySessionModalOpen = useSocialDetailStore(
    (s) => s.setPlaySessionModalOpen
  )
  const selectedSession = useSocialDetailStore((s) => s.selectedSession)
  const setSelectedSession = useSocialDetailStore((s) => s.setSelectedSession)

  const tabValue = useSocialDetailStore((s) => s.tabValue)
  const setTabValue = useSocialDetailStore((s) => s.setTabValue)

  const [isJoining, setIsJoining] = React.useState(false)
  const [isLeaving, setIsLeaving] = React.useState(false)

  const handleConfirmJoin = async (selectedSessionIds: string[]) => {
    if (!initialSocial || selectedSessionIds.length === 0) return
    setIsJoining(true)
    const toastId = toast.loading(t("dialogs.joining"))
    let successCount = 0
    let lastError = ""

    for (const sessionId of selectedSessionIds) {
      const result = await joinPlaySessionAction(initialSocial.id, sessionId)
      if (result.success) {
        successCount++
      } else {
        lastError = result.error || t("dialogs.joinError")
      }
    }

    setIsJoining(false)
    setJoinDialogOpen(false)

    if (successCount > 0) {
      toast.success(t("dialogs.joinSuccess"), { id: toastId })
      router.refresh()
    } else {
      toast.error(lastError || t("dialogs.joinError"), { id: toastId })
    }
  }

  const handleConfirmLeave = async (selectedSessionIds: string[]) => {
    if (!initialSocial || selectedSessionIds.length === 0) return
    setIsLeaving(true)
    const toastId = toast.loading(t("dialogs.leaving"))
    let successCount = 0
    let lastError = ""

    for (const sessionId of selectedSessionIds) {
      const result = await leavePlaySessionAction(initialSocial.id, sessionId)
      if (result.success) {
        successCount++
      } else {
        lastError = result.error || t("dialogs.leaveError")
      }
    }

    setIsLeaving(false)
    setLeaveDialogOpen(false)

    if (successCount > 0) {
      toast.success(t("dialogs.leaveSuccess"), { id: toastId })
      router.refresh()
    } else {
      toast.error(lastError || t("dialogs.leaveError"), { id: toastId })
    }
  }

  const { data: subscriptions } = useMySubscriptions()
  const hasSocialHostPlan = Boolean(
    subscriptions?.some(
      (sub) => sub.status === "ACTIVE" && sub.plan.type === "SOCIAL_HOST"
    )
  )

  const social = initialSocial
  const isEditable =
    Boolean(social?.isHost) && hasSocialHostPlan && social?.status === "DRAFT"

  if (!social) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">{t("detail.notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("detail.notFoundDescription")}
        </p>
        <button
          className="mt-6 rounded-md border px-4 py-2 text-sm"
          onClick={() => router.back()}
        >
          {t("detail.backToSocials")}
        </button>
      </div>
    )
  }

  const isHost = Boolean(social.isHost)
  const duration = differenceInHours(
    new Date(social.endTime),
    new Date(social.startTime)
  )
  const isParticipant = Boolean(
    social.myParticipantInfo &&
    isActiveSocialParticipantStatus(social.myParticipantInfo.status)
  )

  const socialParticipants = initialParticipants
  const sessions = initialPlaySessions

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* <SocialHero isPrivate={Boolean(social.isPrivate)} /> */}

      {social.status === "PUBLISHED" && isSocialExpired(social) && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-300">
          <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            {t(
              "detail.endedBanner",
              "This social has ended. New registrations and invitations are no longer available."
            )}
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <SocialHeader
            title={social.title}
            status={social.status}
            format={social.format}
            isHost={isHost}
            isEditable={isEditable}
            isParticipant={isParticipant}
            isExpired={isSocialExpired(social)}
            onBack={() => router.back()}
            onEdit={() => router.push(`/socials/${social.id}/edit`)}
          />

          <Tabs
            value={tabValue}
            onValueChange={setTabValue}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="0">{t("detail.overview")}</TabsTrigger>
              <TabsTrigger value="1">{t("detail.participants")}</TabsTrigger>
              <TabsTrigger value="2">{t("payment.tab")}</TabsTrigger>
              {isHost && (
                <TabsTrigger value="3">{t("expenses.tab")}</TabsTrigger>
              )}
              {isHost && social.status === "COMPLETED" && (
                <TabsTrigger value="4">{t("statistics.tab")}</TabsTrigger>
              )}
              {(isParticipant || isHost) && social.status === "COMPLETED" && (
                <TabsTrigger value="5">{t("feedback.tab")}</TabsTrigger>
              )}
              {isHost && (
                <TabsTrigger value="6">{t("booking.tab")}</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="0" className="space-y-4">
              <SocialOverview social={social} duration={duration} />
              <SocialSessions
                sessions={sessions}
                isEditable={isEditable}
                onCreateSession={() => {
                  setSelectedSession(null)
                  setPlaySessionModalOpen(true)
                }}
                onEditSession={(session) => {
                  setSelectedSession(session)
                  setPlaySessionModalOpen(true)
                }}
                onOpenSession={(sessionId) =>
                  router.push(`/socials/${social.id}/play-session/${sessionId}`)
                }
              />
            </TabsContent>

            <TabsContent value="1" className="space-y-4">
              <SocialParticipantsTab
                participants={socialParticipants}
                isEditable={isEditable}
                isHost={isHost}
                socialId={social.id}
                status={social.status}
              />
            </TabsContent>

            <TabsContent value="2" className="space-y-4">
              <SocialPaymentTab social={social} joinedSessions={sessions} />
            </TabsContent>

            <TabsContent value="3" className="space-y-4">
              <SocialExpenseTab
                social={social}
                initialParticipants={socialParticipants}
              />
            </TabsContent>

            {isHost && social.status === "COMPLETED" && (
              <TabsContent value="4" className="space-y-4">
                <SocialStatisticsTab
                  social={social}
                  initialParticipants={socialParticipants}
                  playSessions={sessions}
                />
              </TabsContent>
            )}

            {(isParticipant || isHost) && social.status === "COMPLETED" && (
              <TabsContent value="5" className="space-y-4">
                <SocialFeedbackTab socialId={social.id} isHost={isHost} />
              </TabsContent>
            )}

            {isHost && (
              <TabsContent value="6" className="space-y-4">
                <SocialBookingTab social={social} isEditable={isEditable} />
              </TabsContent>
            )}
          </Tabs>
        </div>

        <SocialSidebar
          social={social}
          isParticipant={isParticipant}
          isEditable={isEditable}
        />
      </div>

      <Dialog
        open={playSessionModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPlaySessionModalOpen(false)
            setSelectedSession(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <PlaySessionForm
            socialId={social.id}
            session={selectedSession}
            socialStartTime={social.startTime}
            socialEndTime={social.endTime}
            showCard={false}
            onCancel={() => {
              setPlaySessionModalOpen(false)
              setSelectedSession(null)
            }}
            onSuccess={() => {
              setPlaySessionModalOpen(false)
              setSelectedSession(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <SocialJoinDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        title={social.title}
        autoApproveJoinRequests={social.autoApproveJoinRequests}
        sessions={sessions}
        onConfirm={handleConfirmJoin}
        isJoining={isJoining}
      />

      <SocialLeaveDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        title={social.title}
        sessions={sessions}
        joinedSessionIds={social.myParticipantInfo?.joinedSessionIds}
        onConfirm={handleConfirmLeave}
        isLeaving={isLeaving}
      />

      {/* Invite dialog — only rendered for host */}
      {social.isHost && (
        <SocialInviteDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          socialId={social.id}
        />
      )}

      {/* Confirm dialog — auto-opens when ?inviteCode= or ?invitationId= is in URL */}
      <SocialInviteConfirmDialog
        inviteCode={inviteCode}
        invitationId={invitationId}
        socialId={social.id}
        initialSocial={social}
      />
    </div>
  )
}
