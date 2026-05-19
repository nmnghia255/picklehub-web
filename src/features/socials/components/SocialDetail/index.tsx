"use client"

import { differenceInHours } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import React, { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlaySessionModal } from "@/features/socials/components/play-session/PlaySessionModal"
import { mockSocials } from "@/features/socials/mockData"
import type { Match, PlaySession } from "@/features/socials/types"

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
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [playSessionModalOpen, setPlaySessionModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<PlaySession | null>(
    null
  )
  const [tabValue, setTabValue] = useState("0")

  const socialId = params.socialId as string | undefined
  const social = mockSocials.find((item) => item.id === socialId)

  if (!social) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Social not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The social you are looking for does not exist or is unavailable.
        </p>
        <button
          className="mt-6 rounded-md border px-4 py-2 text-sm"
          onClick={() => router.push("/socials")}
        >
          Back to Socials
        </button>
      </div>
    )
  }

  const isHost = Boolean(social.isHost)
  const duration = differenceInHours(
    new Date(social.endTime),
    new Date(social.startTime)
  )
  const overviewSocial = {
    ...social,
    minimumLevel: social.minimumLevel ?? "N/A",
    maximumLevel: social.maximumLevel ?? "N/A",
  }
  const completedMatches: Match[] = social.playSessions.flatMap(
    (session) =>
      session.matches?.filter((match) => match.status === "COMPLETED") ?? []
  )
  const inProgressMatches: Match[] = social.playSessions.flatMap(
    (session) =>
      session.matches?.filter((match) => match.status === "IN_PROGRESS") ?? []
  )
  const scheduledMatches: Match[] = social.playSessions.flatMap(
    (session) =>
      session.matches?.filter((match) => match.status === "SCHEDULED") ?? []
  )
  const currentSession = selectedSession ?? social.playSessions[0]

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
            onShare={() => alert("Share functionality")}
            onEdit={() => router.push(`/socials/${social.id}/edit`)}
          />

          <Tabs
            value={tabValue}
            onValueChange={setTabValue}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="0">Overview</TabsTrigger>
              <TabsTrigger value="1">
                Participants ({social.joinedCount})
              </TabsTrigger>

              {/* <TabsTrigger value="2">
                Matches (
                {completedMatches.length +
                  inProgressMatches.length +
                  scheduledMatches.length}
                )
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="0" className="space-y-4">
              <SocialOverview social={overviewSocial} duration={duration} />
              <SocialSessions
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
              />
            </TabsContent>

            {/* <TabsContent value="1" className="space-y-4">

            </TabsContent> */}

            <TabsContent value="1" className="space-y-4">
              <SocialParticipants participants={currentSession?.participants} />
            </TabsContent>
          </Tabs>
        </div>

        <SocialSidebar
          session={currentSession ?? { joinedCount: 0, maxSlots: 1 }}
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
