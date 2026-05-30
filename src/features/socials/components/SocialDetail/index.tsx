"use client"

import { useParams, useRouter } from "next/navigation"
import React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useSocialDetailStore from "@/features/socials/stores/social-detail-store"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { usePlaySessionsQuery, useSocialDetailQuery } from "../../api/social-queries"
import SocialHeader from "./SocialHeader"
import SocialHero from "./SocialHero"
import SocialJoinDialog from "./SocialJoinDialog"
import SocialOverview from "./SocialOverview"
import SocialParticipants from "./SocialParticipants"
import SocialSessions from "./SocialSessions"
import SocialSidebar from "./SocialSidebar"

export default function SocialDetail() {
  const params = useParams()
  const router = useRouter()
  const { t } = useSocialsTranslation()
  const joinDialogOpen = useSocialDetailStore((s) => s.joinDialogOpen)
  const setJoinDialogOpen = useSocialDetailStore((s) => s.setJoinDialogOpen)
  const tabValue = useSocialDetailStore((s) => s.tabValue)
  const setTabValue = useSocialDetailStore((s) => s.setTabValue)

  const socialId = params.socialId as string | undefined
  const { data: social, isLoading, isError } = useSocialDetailQuery(socialId)
  const { data: playSessions = [] } = usePlaySessionsQuery(socialId)

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16 text-center text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    )
  }

  if (isError || !social) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">{t("detail.notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("detail.notFoundDescription")}
        </p>
        <button
          className="mt-6 rounded-md border px-4 py-2 text-sm"
          onClick={() => router.push("/socials")}
        >
          {t("detail.backToSocials")}
        </button>
      </div>
    )
  }

  const isHost = Boolean(social.isHost)
  const overviewSocial = {
    ...social,
    minimumLevel: social.minimumLevel ?? "N/A",
    maximumLevel: social.maximumLevel ?? "N/A",
  }
  const currentSession = playSessions[0]

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
            onShare={() => alert(t("common.shareComingSoon"))}
            onEdit={() => router.push(`/socials/${social.id}/edit`)}
          />

          <Tabs
            value={tabValue}
            onValueChange={setTabValue}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="0">{t("detail.overview")}</TabsTrigger>
              <TabsTrigger value="1">
                {t("detail.participants")} {/* ({social.joinedCount}) */}
              </TabsTrigger>

            </TabsList>

            <TabsContent value="0" className="space-y-4">
                <SocialOverview social={overviewSocial} />
              <SocialSessions
                  sessions={playSessions}
                isHost={isHost}
                onOpenSession={(sessionId) =>
                  router.push(`/socials/${social.id}/play-session/${sessionId}`)
                }
              />
            </TabsContent>

            <TabsContent value="1" className="space-y-4">
              <SocialParticipants participants={social.participants} />
            </TabsContent>

          </Tabs>
        </div>

        <SocialSidebar
          session={currentSession ?? { joinedCount: social.joinedCount, maxSlots: social.maxSlots }}
          social={social}
          onJoin={() => setJoinDialogOpen(true)}
          onLeave={() => alert(t("common.leaveSocialComingSoon"))}
        />
      </div>

      <SocialJoinDialog
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        title={social.title}
        autoApproveJoinRequests={social.autoApproveJoinRequests}
      />
    </div>
  )
}
