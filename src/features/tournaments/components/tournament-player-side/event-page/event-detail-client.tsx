"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { User } from "@/features/profile/types"
import { BracketManagement } from "@/features/tournaments/components/bracket-tab/bracket-management"
import { GroupManagement } from "@/features/tournaments/components/group-tab/group-management"
import { EventHero } from "@/features/tournaments/components/tournament-player-side/event-page/event-hero"
import { EventInfoCard } from "@/features/tournaments/components/tournament-player-side/event-page/event-info-card"
import { EventPrizesCard } from "@/features/tournaments/components/tournament-player-side/event-page/event-prizes-card"
import { EventRegistrationCard } from "@/features/tournaments/components/tournament-player-side/event-page/event-registration-card"
import { EventStandingTab } from "@/features/tournaments/components/tournament-player-side/event-page/event-standing-tab"
import { EventTeamsTab } from "@/features/tournaments/components/tournament-player-side/event-page/event-teams-tab"
import { PaymentProofDialog } from "@/features/tournaments/components/tournament-player-side/event-page/payment-proof-dialog"
import { RegisterConfirmDialog } from "@/features/tournaments/components/tournament-player-side/event-page/register-confirm-dialog"
import { MatchListTab } from "@/features/tournaments/components/tournament-player-side/tabs/match-list-tab"
import { useEventStore } from "@/features/tournaments/stores/use-event-store"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import type { Match } from "../../../types/match"
import type { Player, Team } from "../../../types/player"
import type { TournamentPrize } from "../../../types/prize"
import type {
  RegistrationRequest,
  RegistrationResponse,
} from "../../../types/registration"
import type { TournamentSchedule } from "../../../types/schedule"
import type { Tournament } from "../../../types/tournament"
import type { TournamentEvent } from "../../../types/tournament-event"

interface EventDetailClientProps {
  tournament: Tournament
  event: TournamentEvent
  prizes: TournamentPrize[]
  registrations: RegistrationResponse[]
  currentUser: User
  initialMatches: TournamentSchedule[]
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
  const {
    isRegistering,
    isRegisterConfirmOpen,
    isPaymentProofOpen,
    activeStage,
    setActiveStage,
    setRegisterConfirmOpen,
    setPaymentProofOpen,
    registerForEvent,
  } = useEventStore()

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
        id: reg.player.id || reg.player.userId,
        userId: reg.player.userId || reg.player.id,
        name: reg.player.name,
        rating: reg.player.rating || 0.0,
        avatar:
          reg.player.avatar || reg.player.name.substring(0, 2).toUpperCase(),
        event: reg.event,
      })
    }
    if (reg.partner) {
      list.push({
        id: reg.partner.id || reg.partner.userId,
        userId: reg.partner.userId || reg.partner.id,
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
  let rawMatches: TournamentSchedule[] = []
  if (Array.isArray(initialMatches)) {
    rawMatches = initialMatches
  } else if (initialMatches && typeof initialMatches === "object") {
    const obj = initialMatches as Record<string, unknown>
    if ("fixtures" in obj && Array.isArray(obj.fixtures)) {
      rawMatches = obj.fixtures as TournamentSchedule[]
    } else if ("data" in obj && Array.isArray(obj.data)) {
      rawMatches = obj.data as TournamentSchedule[]
    } else if ("matches" in obj && Array.isArray(obj.matches)) {
      rawMatches = obj.matches as TournamentSchedule[]
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
        bookingId: m.bookingId ? Number(m.bookingId) : null,
      } as Match
    })
    .filter((m) => m.eventId === event.id || m.event === event.name)

  const handleRegister = async (partner?: User) => {
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

    const isSingles = event.type === "Singles"

    const payload: RegistrationRequest = {
      playerId: currentUser.id || "",
      playerName: currentUser.fullName || "",
      playerRating: ratingVal,
      playerAvatar: currentUser.avatarUrl || "",
      playerGender:
        currentUser.gender?.toUpperCase() === "MALE" ||
        currentUser.gender?.toUpperCase() === "M"
          ? "M"
          : "F",
      playerAge: 25,
      playerDuprId: currentUser.dupr?.duprId || "",
      paymentStatus:
        event.entryFee && event.entryFee > 0 ? "pending" : "completed",
      ...(!isSingles && partner
        ? {
            partnerId: partner.id,
            partnerName: partner.fullName || "",
            partnerRating: partnerRatingVal,
            partnerAvatar: partner.avatarUrl || "",
            partnerGender:
              partner.gender?.toUpperCase() === "MALE" ||
              partner.gender?.toUpperCase() === "M"
                ? "M"
                : "F",
            partnerAge: 25,
            partnerDuprId: partner.dupr?.duprId || "",
          }
        : {}),
    }

    try {
      const res = await registerForEvent(
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
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <EventHero tournament={tournament} event={event} />

        {/* Tab Controls */}
        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList
              className={cn(
                "border-gray-150 mb-8 grid h-12 w-full rounded-xl border bg-white p-0.5 shadow-sm",
                tournament.status === "completed"
                  ? "grid-cols-5"
                  : "grid-cols-4"
              )}
            >
              <TabsTrigger
                value="overview"
                className="rounded-lg text-xs font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white md:text-sm"
              >
                {t("public.tabs.overview")}
              </TabsTrigger>
              {tournament.status === "completed" && (
                <TabsTrigger
                  value="standing"
                  className="rounded-lg text-xs font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white md:text-sm"
                >
                  {t("public.tabs.standing", { defaultValue: "Standing" })}
                </TabsTrigger>
              )}
              <TabsTrigger
                value="groups"
                className="rounded-lg text-xs font-medium text-gray-600 transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white md:text-sm"
              >
                {t("manager.tabs.groups", { defaultValue: "Group & Bracket" })}
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
                    onRegisterClick={() => setRegisterConfirmOpen(true)}
                    onUploadProofClick={() => setPaymentProofOpen(true)}
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
              <div className="border-gray-150 flex w-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
                {/* Stage switcher pills */}
                <div className="border-gray-150 flex shrink-0 items-center gap-1 border-b bg-gray-50/50 p-4 dark:bg-zinc-800">
                  <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-zinc-800">
                    <button
                      onClick={() => setActiveStage("group")}
                      className={cn(
                        "rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 md:text-sm",
                        activeStage === "group"
                          ? "bg-white text-emerald-700 shadow-xs dark:bg-zinc-700 dark:text-emerald-400"
                          : "text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                      )}
                    >
                      {t("groupStage.stageSwitcher.group", {
                        defaultValue: "Group Stage",
                      })}
                    </button>
                    <button
                      onClick={() => setActiveStage("knockout")}
                      className={cn(
                        "rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 md:text-sm",
                        activeStage === "knockout"
                          ? "bg-white text-emerald-700 shadow-xs dark:bg-zinc-700 dark:text-emerald-400"
                          : "text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                      )}
                    >
                      {t("groupStage.stageSwitcher.knockout", {
                        defaultValue: "Knockout Stage",
                      })}
                    </button>
                  </div>
                </div>

                <div
                  className={cn(
                    "w-full",
                    activeStage === "group" ? "" : "h-[600px] overflow-hidden"
                  )}
                >
                  {activeStage === "group" ? (
                    <GroupManagement
                      tournamentId={Number(tournament.id)}
                      events={[event]}
                      isHost={false}
                      eventId={Number(event.id)}
                      hideEventSelect={true}
                      isEditable={false}
                    />
                  ) : (
                    <BracketManagement
                      tournamentId={Number(tournament.id)}
                      events={[event]}
                      isHost={false}
                      eventId={Number(event.id)}
                      hideEventSelect={true}
                      isEditable={false}
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Standing Tab Content */}
            {tournament.status === "completed" && (
              <TabsContent
                value="standing"
                className="mt-0 focus-visible:outline-none"
              >
                <EventStandingTab
                  tournamentId={String(tournament.id)}
                  eventId={String(event.id)}
                />
              </TabsContent>
            )}

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
          </Tabs>
        </div>
      </div>

      {/* Registration Confirmation Dialog */}
      <RegisterConfirmDialog
        isOpen={isRegisterConfirmOpen}
        onOpenChange={setRegisterConfirmOpen}
        currentUser={currentUser}
        event={event}
        onConfirm={async (partner) => {
          setRegisterConfirmOpen(false)
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
          onOpenChange={setPaymentProofOpen}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  )
}
