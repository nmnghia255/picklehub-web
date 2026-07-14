"use client"

import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OpenChatButton } from "@/features/chat/components/open-chat-button"
import type { User } from "@/features/profile/types"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import { listMyAssignmentsAction } from "../../../actions/referee-actions"
import { getMyProfileAction } from "../../../actions/tournament-registration-actions"
import type { Player } from "../../../types/player"
import type { AssignedReferee } from "../../../types/referee"
import type { Sponsor as TournamentSponsor } from "../../../types/sponsor"
import type { Tournament } from "../../../types/tournament"
import type { TournamentEvent } from "../../../types/tournament-event"
import { EventsTab } from "./events-tab"
import { TournamentHero } from "./hero-section"
import { TournamentOverview } from "./overview-tab"
import { ParticipantsTab } from "./participants-tab"
import { PaymentTab } from "./payment-tab"
import { RefereeTab } from "./referee-tab"

interface PlayerTournamentProps {
  tournament?: Tournament
  events?: TournamentEvent[]
  sponsors?: TournamentSponsor[]
  participants?: Player[]
  totalPrizes?: number
}

export function PlayerTournament({
  tournament,
  events = [],
  sponsors = [],
  participants = [],
  totalPrizes = 0,
}: PlayerTournamentProps) {
  const { t } = useTournamentTranslation()
  const { t: tCommon } = useTranslation("common")
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") || "overview"
  const [activeTab, setActiveTab] = useState(tabParam)

  useEffect(() => {
    if (tabParam) {
      const timerId = setTimeout(() => {
        setActiveTab(tabParam)
      }, 0)
      return () => clearTimeout(timerId)
    }
  }, [tabParam])

  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(
    null
  )
  const [refereeMatches, setRefereeMatches] = useState<AssignedReferee[]>([])
  const [isReferee, setIsReferee] = useState<boolean>(false)

  useEffect(() => {
    getMyProfileAction().then((res) => {
      if (res.success && res.data) {
        setCurrentUserProfile(res.data)
      }
    })
  }, [])

  const fetchRefereeAssignments = useCallback(() => {
    if (tournament?.id) {
      listMyAssignmentsAction(String(tournament.id)).then((res) => {
        if (res.success && res.data) {
          setRefereeMatches(res.data.assignments)
          setIsReferee(res.data.isReferee)
        }
      })
    }
  }, [tournament])

  useEffect(() => {
    fetchRefereeAssignments()
  }, [fetchRefereeAssignments])

  const isParticipant = Boolean(
    currentUserProfile &&
    participants.some(
      (p) => p.name.toLowerCase() === currentUserProfile.fullName?.toLowerCase()
    )
  )

  // Fallbacks for display
  const displaySponsors: TournamentSponsor[] = sponsors
  const displayParticipants = participants

  const hasRefereeAssignments = isReferee

  const myAssignments = refereeMatches
  const canOpenChat = Boolean(
    tournament?.id &&
    (currentUserProfile?.id === String(tournament.organizerId) ||
      isParticipant ||
      hasRefereeAssignments)
  )

  // Calculate dynamic grid cols class
  let colsClass = "grid-cols-3"
  let tabsCount = 3
  if (isParticipant) tabsCount++
  if (hasRefereeAssignments) tabsCount++

  if (tabsCount === 5) {
    colsClass = "grid-cols-5"
  } else if (tabsCount === 4) {
    colsClass = "grid-cols-4"
  }

  // Calculate dynamic stats
  const participantsCount = events.reduce((acc, event) => {
    const isDouble =
      event.type?.toLowerCase() === "doubles" ||
      event.type?.toLowerCase() === "double"
    const multiplier = isDouble ? 2 : 1
    return acc + (event.participants ?? 0) * multiplier
  }, 0)
  const eventsCount = events.length

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <TournamentHero tournament={tournament} />

      {canOpenChat && (
        <div className="mx-auto mt-6 flex max-w-7xl justify-end px-4 sm:px-6 lg:px-8">
          <OpenChatButton
            kind="tournament"
            targetId={String(tournament?.id)}
            label={tCommon("chat.actions.openTournament")}
            variant="secondary"
          />
        </div>
      )}

      {/* Content Container */}
      <div className="mx-auto mt-8 max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Tab Controls */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={cn(
              "border-gray-150 mb-8 grid h-12 w-full rounded-xl border bg-white p-0.5 shadow-sm",
              colsClass
            )}
          >
            <TabsTrigger
              value="overview"
              className="rounded-lg font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {t("public.tabs.overview")}
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="rounded-lg font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {t("manager.tabs.events")}
            </TabsTrigger>
            <TabsTrigger
              value="participants"
              className="rounded-lg font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {t("public.tabs.participants")}
            </TabsTrigger>
            {hasRefereeAssignments && (
              <TabsTrigger
                value="referee"
                className="rounded-lg font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                {t("public.tabs.referee", { defaultValue: "Referee" })}
              </TabsTrigger>
            )}
            {isParticipant && (
              <TabsTrigger
                value="payment"
                className="rounded-lg font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                {t("public.tabs.payment")}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent
            value="overview"
            className="mt-0 space-y-6 focus-visible:outline-none"
          >
            <TournamentOverview
              tournament={tournament}
              participantsCount={participantsCount}
              eventsCount={eventsCount}
              totalPrizes={totalPrizes}
              sponsors={displaySponsors}
            />
          </TabsContent>

          {/* Events Tab Content */}
          <TabsContent
            value="events"
            className="mt-0 focus-visible:outline-none"
          >
            <EventsTab tournamentId={String(tournament?.id)} events={events} />
          </TabsContent>

          {/* Participants Tab Content */}
          <TabsContent
            value="participants"
            className="mt-0 focus-visible:outline-none"
          >
            <ParticipantsTab participants={displayParticipants} />
          </TabsContent>

          {/* Referee Tab Content */}
          {hasRefereeAssignments && (
            <TabsContent
              value="referee"
              className="mt-0 focus-visible:outline-none"
            >
              <RefereeTab
                assignments={myAssignments}
                tournamentId={tournament?.id ? Number(tournament.id) : 0}
              />
            </TabsContent>
          )}

          {/* Payment Tab Content */}
          {isParticipant && (
            <TabsContent
              value="payment"
              className="mt-0 focus-visible:outline-none"
            >
              <PaymentTab tournament={tournament} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
