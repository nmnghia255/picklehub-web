"use client"

import { differenceInHours } from "date-fns"
import { useRouter } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlaySessionModal } from "@/features/socials/components/play-session/play-session-modal"
import useSocialDetailStore from "@/features/socials/stores/social-detail-store"
import { useSocialsStore } from "@/features/socials/stores/social-listing-store"
import type { PlaySession } from "@/features/socials/types/play-session"
import type {
  ListSocialResponse as Social,
  SocialParticipant,
} from "@/features/socials/types/social"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import SocialExpenseTab from "./social-expense-tab"
import SocialHeader from "./social-header"
import SocialHero from "./social-hero"
import SocialJoinDialog from "./social-join-dialog"
import SocialOverview from "./social-overview"
import SocialParticipantsTab from "./social-participants-tab"
import SocialPaymentTab from "./social-payment-tab"
import SocialSessions from "./social-session"
import SocialSidebar from "./social-sidebar"

interface SocialDetailProps {
  initialSocial: Social | null
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
  const joinDialogOpen = useSocialDetailStore((s) => s.joinDialogOpen)
  const setJoinDialogOpen = useSocialDetailStore((s) => s.setJoinDialogOpen)

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

  const selectedSocial = useSocialsStore((s) => s.selectedSocial)

  const social = initialSocial || selectedSocial

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

  const socialParticipants = initialParticipants
  const sessions = initialPlaySessions
  const maxSlots = social.maxSlots
  console.log("SocialDetail render", { social, socialParticipants, sessions })

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
            isParticipant={social.isParticipant}
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
              <TabsTrigger value="2">{t("expenses.tab")}</TabsTrigger>
              <TabsTrigger value="3">
                {t("payment.tab", { defaultValue: "Payment" })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="0" className="space-y-4">
              <SocialOverview social={social} duration={duration} />
              <SocialSessions
                maxSlots={maxSlots}
                sessions={sessions}
                isHost={isHost}
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
              <SocialParticipantsTab participants={socialParticipants} />
            </TabsContent>

            <TabsContent value="2" className="space-y-4">
              <SocialExpenseTab />
            </TabsContent>

            <TabsContent value="3" className="space-y-4">
              <SocialPaymentTab social={social} />
            </TabsContent>
          </Tabs>
        </div>

        <SocialSidebar
          social={social}
          onJoin={() => setJoinDialogOpen(true)}
          onLeave={() => alert("Leave social")}
        />
      </div>

      <SocialJoinDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        title={social.title}
        autoApproveJoinRequests={social.autoApproveJoinRequests}
      />

      <PlaySessionModal
        open={playSessionModalOpen}
        onClose={() => {
          setPlaySessionModalOpen(false)
          setSelectedSession(null)
        }}
        session={selectedSession}
        socialId={social.id}
      />
    </div>
  )
}
