"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { User } from "@/features/profile/types"
import { registerTournamentEventAction } from "@/features/tournaments/actions/tournament-registration-actions"
import { BracketManagement } from "@/features/tournaments/components/bracket-tab/bracket-management"
import { GroupManagement } from "@/features/tournaments/components/group-tab/group-management"
import { EventHero } from "@/features/tournaments/components/tournament-player-side/event-page/event-hero"
import { EventInfoCard } from "@/features/tournaments/components/tournament-player-side/event-page/event-info-card"
import { EventPrizesCard } from "@/features/tournaments/components/tournament-player-side/event-page/event-prizes-card"
import { EventRegistrationCard } from "@/features/tournaments/components/tournament-player-side/event-page/event-registration-card"
import { EventTeamsTab } from "@/features/tournaments/components/tournament-player-side/event-page/event-teams-tab"
import { PaymentProofDialog } from "@/features/tournaments/components/tournament-player-side/event-page/payment-proof-dialog"
import { RegisterConfirmDialog } from "@/features/tournaments/components/tournament-player-side/event-page/register-confirm-dialog"
import { MatchListTab } from "@/features/tournaments/components/tournament-player-side/match-list-tab"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Match } from "../../../types/match"
import type { Player, Team } from "../../../types/player"
import type { TournamentPrize } from "../../../types/prize"
import type {
  RegistrationRequest,
  RegistrationResponse,
} from "../../../types/registration"
import type { Tournament } from "../../../types/tournament"
import type { TournamentEvent } from "../../../types/tournament-event"

interface EventDetailClientProps {
  tournament: Tournament
  event: TournamentEvent
  prizes: TournamentPrize[]
  registrations: RegistrationResponse[]
  currentUser: User
  initialMatches: Match[]
  initialTeams?: Team[]
}

export function EventDetailClient({
  tournament,
  event,
  prizes = [],
  registrations = [],
  currentUser,
  initialMatches = [],
  initialTeams = [],
}: EventDetailClientProps) {
  const router = useRouter()
  const { t } = useTournamentTranslation()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegisterConfirmOpen, setIsRegisterConfirmOpen] = useState(false)
  const [isPaymentProofOpen, setIsPaymentProofOpen] = useState(false)

  // Check if current user is registered
  const userRegistration = registrations.find(
    (reg) =>
      String(reg.player?.id) === String(currentUser.id) ||
      (reg.partner && String(reg.partner.id) === String(currentUser.id))
  )

  const handleRegistrationSuccess = () => {
    // Dynamically refresh the page to reload server-side props
    router.refresh()
  }

  // Construct event participants list from approved registrations
  const approvedRegistrations = registrations.filter(
    (reg) => reg.status === "approved"
  )
  const eventParticipants = approvedRegistrations.flatMap((reg) => {
    const list: Player[] = []
    if (reg.player) {
      list.push({
        name: reg.player.name,
        rating: reg.player.rating || 0.0,
        avatar:
          reg.player.avatar || reg.player.name.substring(0, 2).toUpperCase(),
        event: reg.event,
      })
    }
    if (reg.partner) {
      list.push({
        name: reg.partner.name,
        rating: reg.partner.rating || 0.0,
        avatar:
          reg.partner.avatar || reg.partner.name.substring(0, 2).toUpperCase(),
        event: reg.event,
      })
    }
    return list
  })

  // Robust check to extract array of matches
  let rawMatches: Match[] = []
  if (Array.isArray(initialMatches)) {
    rawMatches = initialMatches
  } else if (initialMatches && typeof initialMatches === "object") {
    const obj = initialMatches as Record<string, unknown>
    if ("fixtures" in obj && Array.isArray(obj.fixtures)) {
      rawMatches = obj.fixtures as Match[]
    } else if ("data" in obj && Array.isArray(obj.data)) {
      rawMatches = obj.data as Match[]
    } else if ("matches" in obj && Array.isArray(obj.matches)) {
      rawMatches = obj.matches as Match[]
    }
  }

  // Map and filter tournament fixtures for this event
  const eventMatches = rawMatches
    .map((m) => {
      return {
        ...m,
        team1:
          typeof m.team1 === "object" && m.team1
            ? m.team1
            : { name: String(m.team1 || "TBD") },
        team2:
          typeof m.team2 === "object" && m.team2
            ? m.team2
            : { name: String(m.team2 || "TBD") },
      } as Match
    })
    .filter((m) => m.eventId === event.id || m.event === event.name)

  const handleRegister = async (partner?: User) => {
    setIsRegistering(true)

    let ratingVal = currentUser.selfRating || 3.0
    if (currentUser.dupr) {
      if (event.type === "Singles") {
        ratingVal =
          currentUser.dupr.singlesRating || currentUser.dupr.rating || ratingVal
      } else {
        ratingVal =
          currentUser.dupr.doublesRating || currentUser.dupr.rating || ratingVal
      }
    }

    let partnerRatingVal = 0.0
    if (partner) {
      partnerRatingVal = partner.selfRating || 3.0
      if (partner.dupr) {
        if (event.type === "Singles") {
          partnerRatingVal =
            partner.dupr.singlesRating ||
            partner.dupr.rating ||
            partnerRatingVal
        } else {
          partnerRatingVal =
            partner.dupr.doublesRating ||
            partner.dupr.rating ||
            partnerRatingVal
        }
      }
    }

    const payload: RegistrationRequest = {
      playerId: currentUser.id || "",
      playerName: currentUser.fullName || "",
      playerRating: ratingVal,
      playerAvatar: currentUser.avatarUrl || "",
      playerGender: currentUser.gender || "MALE",
      playerAge: 25,
      playerDuprId: currentUser.dupr?.duprId || "",
      partnerId: partner?.id || "",
      partnerName: partner?.fullName || "",
      partnerRating: partnerRatingVal,
      partnerAvatar: partner?.avatarUrl || "",
      partnerGender: partner?.gender || "MALE",
      partnerAge: 25,
      partnerDuprId: partner?.dupr?.duprId || "",
      paymentStatus: event.entryFee && event.entryFee > 0 ? "pending" : "paid",
    }

    try {
      const res = await registerTournamentEventAction(
        String(tournament.id),
        String(event.id),
        payload
      )
      if (res.success) {
        toast.success(
          t("eventDetail.registerSuccess", {
            eventName: event.name,
            defaultValue: `Registered successfully for ${event.name}!`,
          })
        )
        router.refresh()
      } else {
        toast.error(
          res.error ||
            t("eventDetail.registerFailure", {
              defaultValue: "Failed to register",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("eventDetail.registerError", {
          defaultValue: "An unexpected error occurred during registration",
        })
      )
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <EventHero tournament={tournament} event={event} />

        {/* Tab Controls */}
        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="border-gray-150 mb-8 grid h-12 w-full grid-cols-5 rounded-xl border bg-white p-0.5 shadow-sm">
              <TabsTrigger
                value="overview"
                className="rounded-lg text-xs font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white md:text-sm"
              >
                {t("public.tabs.overview")}
              </TabsTrigger>
              <TabsTrigger
                value="groups"
                className="rounded-lg text-xs font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white md:text-sm"
              >
                {t("manager.tabs.groups", { defaultValue: "Group Stage" })}
              </TabsTrigger>
              <TabsTrigger
                value="matches"
                className="rounded-lg text-xs font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white md:text-sm"
              >
                {t("public.tabs.matches", { defaultValue: "Matches" })}
              </TabsTrigger>
              <TabsTrigger
                value="participants"
                className="rounded-lg text-xs font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white md:text-sm"
              >
                {t("public.tabs.participants")}
              </TabsTrigger>
              <TabsTrigger
                value="brackets"
                className="rounded-lg text-xs font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white md:text-sm"
              >
                {t("manager.tabs.brackets", { defaultValue: "Bracket" })}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab Content */}
            <TabsContent
              value="overview"
              className="mt-0 focus-visible:outline-none"
            >
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Left / Info Cards */}
                <div className="space-y-6 md:col-span-2">
                  <EventInfoCard event={event} />
                  <EventPrizesCard prizes={prizes} eventId={event.id} />
                </div>

                {/* Right / Registration Actions Card */}
                <div className="space-y-6">
                  <EventRegistrationCard
                    event={event}
                    userRegistration={userRegistration}
                    onRegisterClick={() => setIsRegisterConfirmOpen(true)}
                    onUploadProofClick={() => setIsPaymentProofOpen(true)}
                    isRegistering={isRegistering}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Groups Tab Content */}
            <TabsContent
              value="groups"
              className="mt-0 focus-visible:outline-none"
            >
              <GroupManagement
                tournamentId={Number(tournament.id)}
                events={[event]}
                isHost={false}
                eventId={Number(event.id)}
                hideEventSelect={true}
              />
            </TabsContent>

            {/* Matches Tab Content */}
            <TabsContent
              value="matches"
              className="mt-0 focus-visible:outline-none"
            >
              <MatchListTab matches={eventMatches} />
            </TabsContent>

            {/* Participants Tab Content */}
            <TabsContent
              value="participants"
              className="mt-0 focus-visible:outline-none"
            >
              <EventTeamsTab
                teams={initialTeams}
                isSingles={event.type === "Singles"}
              />
            </TabsContent>

            {/* Brackets Tab Content */}
            <TabsContent
              value="brackets"
              className="mt-0 focus-visible:outline-none"
            >
              <BracketManagement
                tournamentId={Number(tournament.id)}
                events={[event]}
                isHost={false}
                eventId={Number(event.id)}
                hideEventSelect={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Registration Confirmation Dialog */}
      <RegisterConfirmDialog
        isOpen={isRegisterConfirmOpen}
        onOpenChange={setIsRegisterConfirmOpen}
        currentUser={currentUser}
        event={event}
        onConfirm={async (partner) => {
          setIsRegisterConfirmOpen(false)
          await handleRegister(partner)
        }}
        isRegistering={isRegistering}
      />

      {/* Payment Proof Upload Dialog */}
      {userRegistration && (
        <PaymentProofDialog
          tournamentId={String(tournament.id)}
          registrationId={String(userRegistration.id)}
          isOpen={isPaymentProofOpen}
          onOpenChange={setIsPaymentProofOpen}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  )
}
