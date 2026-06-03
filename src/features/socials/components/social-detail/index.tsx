"use client"

import { differenceInHours } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { PlaySessionModal } from "@/features/socials/components/play-session/PlaySessionModal"
import { mockSocials } from "@/features/socials/mock-data/mockData"
import useSocialDetailStore from "@/features/socials/stores/social-detail-store"
import { useSocialsStore } from "@/features/socials/stores/social-listing-store"
// import type { ListSocialResponse as Social } from "@/features/socials/types/social"
import type { SocialParticipant } from "@/features/socials/types/social"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import SocialOverview from "./social-overview"
import SocialParticipantsTab from "./social-participants-tab"
import SocialExpenseTab from "./SocialExpenseTab"
import SocialHeader from "./SocialHeader"
import SocialHero from "./SocialHero"
import SocialJoinDialog from "./SocialJoinDialog"
// import SocialSessions from "./SocialSessions"
import SocialSidebar from "./SocialSidebar"

export default function SocialDetail() {
  const params = useParams()
  const router = useRouter()
  const { t } = useSocialsTranslation()
  const joinDialogOpen = useSocialDetailStore((s) => s.joinDialogOpen)
  const setJoinDialogOpen = useSocialDetailStore((s) => s.setJoinDialogOpen)
  /*
  const playSessionModalOpen = useSocialDetailStore(
    (s) => s.playSessionModalOpen
  )
  const setPlaySessionModalOpen = useSocialDetailStore(
    (s) => s.setPlaySessionModalOpen
  )
  const selectedSession = useSocialDetailStore((s) => s.selectedSession)
  const setSelectedSession = useSocialDetailStore((s) => s.setSelectedSession)
  */
  const tabValue = useSocialDetailStore((s) => s.tabValue)
  const setTabValue = useSocialDetailStore((s) => s.setTabValue)

  // const selectedSocial = useSocialsStore((s) => s.selectedSocial)

  const socialId = params.socialId as string | undefined
  const social = mockSocials.find((item) => item.id === socialId)

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

  // const completedMatches: Match[] = social.playSessions.flatMap(
  //   (session) =>
  //     session.matches?.filter((match) => match.status === "COMPLETED") ?? []
  // )
  // const inProgressMatches: Match[] = social.playSessions.flatMap(
  //   (session) =>
  //     session.matches?.filter((match) => match.status === "IN_PROGRESS") ?? []
  // )
  // const scheduledMatches: Match[] = social.playSessions.flatMap(
  //   (session) =>
  //     session.matches?.filter((match) => match.status === "SCHEDULED") ?? []
  // )
  // const currentSession = selectedSession ?? social.playSessions[0]

  const socialParticipants = [] as SocialParticipant[]

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
            </TabsList>

            <TabsContent value="0" className="space-y-4">
              <SocialOverview social={social} duration={duration} />
              {/* <SocialSessions
                sessions={social.playSessions}
                isHost={isHost}
                matchesByStatus={{
                  inProgress: inProgressMatches,
                  scheduled: scheduledMatches,
                  completed: completedMatches,
                }}
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
              /> */}
            </TabsContent>

            <TabsContent value="1" className="space-y-4">
              <SocialParticipantsTab participants={socialParticipants} />
            </TabsContent>

            <TabsContent value="2" className="space-y-4">
              <SocialExpenseTab />
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

      {/* <PlaySessionModal
        open={playSessionModalOpen}
        onClose={() => {
          setPlaySessionModalOpen(false)
          setSelectedSession(null)
        }}
        session={selectedSession}
        socialId={social.id}
      /> */}
    </div>
  )
}
