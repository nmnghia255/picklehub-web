"use client"

import { differenceInHours } from "date-fns"
import { useRouter } from "next/navigation"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlaySessionForm } from "@/features/socials/components/play-session/play-session-form"
import useSocialDetailStore from "@/features/socials/stores/social-detail-store"
import type { PlaySession } from "@/features/socials/types/play-session"
import type {
  SocialDetail,
  SocialParticipant,
} from "@/features/socials/types/social"
import { useMySubscriptions } from "@/features/subscriptions/hooks/use-my-subscriptions"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import SocialExpenseTab from "./expense-tab/social-expense-tab"
import SocialFeedbackTab from "./feedback-tab/social-feedback-tab"
import SocialOverview from "./overview-tab/social-overview"
import SocialSessions from "./overview-tab/social-session"
import SocialParticipantsTab from "./participants-tab/social-participants-tab"
import SocialPaymentTab from "./payment-tab/social-payment-tab"
import SocialHeader from "./social-header"
import SocialHero from "./social-hero"
import SocialSidebar from "./social-sidebar"
import SocialStatisticsTab from "./statistics-tab/social-statistics-tab"

interface SocialDetailProps {
  initialSocial: SocialDetail | null
  initialParticipants: SocialParticipant[]
  initialPlaySessions: PlaySession[]
}

export default function SocialDetail({
  initialSocial,
  initialParticipants,
  initialPlaySessions,
}: SocialDetailProps) {
  const router = useRouter()
  const { t } = useSocialsTranslation()

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
    social.myParticipantInfo && social.myParticipantInfo.status !== "CANCELLED"
  )

  const socialParticipants = initialParticipants
  const sessions = initialPlaySessions

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <SocialHero isPrivate={social.isPrivate} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <SocialHeader
            title={social.title}
            status={social.status}
            format={social.format}
            isHost={isHost}
            isEditable={isEditable}
            isParticipant={isParticipant}
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
    </div>
  )
}
