"use client"

import { useEffect, useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { User } from "@/features/profile/types"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import { getMyProfileAction } from "../../actions/tournament-registration-actions"
import type { Match } from "../../types/match"
import type { Player } from "../../types/player"
import type { Sponsor as TournamentSponsor } from "../../types/sponsor"
import type { Tournament } from "../../types/tournament"
import type { TournamentEvent } from "../../types/tournament-event"
import { BracketManagement } from "../bracket-tab/bracket-management"
import { EventsTab } from "./events-tab"
import { TournamentHero } from "./hero-section"
import { MatchListTab } from "./match-list-tab"
import { TournamentOverview } from "./overview-tab"
import { ParticipantsTab } from "./participants-tab"
import { PaymentTab } from "./payment-tab"

interface PlayerTournamentProps {
  tournament?: Tournament
  events?: TournamentEvent[]
  sponsors?: TournamentSponsor[]
  participants?: Player[]
  matches?: Match[]
}

export function PlayerTournament({
  tournament,
  events = [],
  sponsors = [],
  participants = [],
  matches = [],
}: PlayerTournamentProps) {
  const { t } = useTournamentTranslation()

  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(
    null
  )

  useEffect(() => {
    getMyProfileAction().then((res) => {
      if (res.success && res.data) {
        setCurrentUserProfile(res.data)
      }
    })
  }, [])

  const isParticipant = Boolean(
    currentUserProfile &&
    participants.some(
      (p) => p.name.toLowerCase() === currentUserProfile.fullName?.toLowerCase()
    )
  )

  // Fallbacks for display
  const displaySponsors: TournamentSponsor[] = sponsors
  const displayParticipants = participants
  const displayLiveScores = matches

  // Calculate dynamic stats
  const participantsCount = events.reduce((acc, event) => {
    const isDouble =
      event.type?.toLowerCase() === "doubles" ||
      event.type?.toLowerCase() === "double"
    const multiplier = isDouble ? 2 : 1
    return acc + (event.participants ?? 0) * multiplier
  }, 0)
  const eventsCount = events.length
  const totalMatchesCount = 0

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <TournamentHero tournament={tournament} />

      {/* Content Container */}
      <div className="mx-auto mt-8 max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Tab Controls */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList
            className={cn(
              "border-gray-150 mb-8 grid h-12 w-full rounded-xl border bg-white p-0.5 shadow-sm",
              isParticipant ? "grid-cols-7" : "grid-cols-6"
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
              value="schedule"
              className="rounded-lg font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {t("public.tabs.schedule")}
            </TabsTrigger>
            <TabsTrigger
              value="participants"
              className="rounded-lg font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {t("public.tabs.participants")}
            </TabsTrigger>
            <TabsTrigger
              value="brackets"
              className="rounded-lg font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {t("manager.tabs.brackets", { defaultValue: "Bracket" })}
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="rounded-lg font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {t("public.tabs.results")}
            </TabsTrigger>
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
              totalMatchesCount={totalMatchesCount}
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

          {/* Schedule Tab Content */}
          <TabsContent
            value="schedule"
            className="mt-0 focus-visible:outline-none"
          >
            <MatchListTab type="schedule" matches={[]} />
          </TabsContent>

          {/* Participants Tab Content */}
          <TabsContent
            value="participants"
            className="mt-0 focus-visible:outline-none"
          >
            <ParticipantsTab participants={displayParticipants} />
          </TabsContent>

          {/* Brackets Tab Content */}
          <TabsContent
            value="brackets"
            className="mt-0 focus-visible:outline-none"
          >
            {tournament && (
              <BracketManagement
                tournamentId={tournament.id}
                events={events}
                isHost={false}
              />
            )}
          </TabsContent>

          {/* Results Tab Content */}
          <TabsContent
            value="results"
            className="mt-0 focus-visible:outline-none"
          >
            <MatchListTab type="results" matches={displayLiveScores} />
          </TabsContent>

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
