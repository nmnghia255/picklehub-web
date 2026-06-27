"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import type { User } from "@/features/profile/types"
import { registerTournamentEventAction } from "@/features/tournaments/actions/tournament-registration-actions"
import { EventHero } from "@/features/tournaments/components/tournament-player-side/event-page/event-hero"
import { EventInfoCard } from "@/features/tournaments/components/tournament-player-side/event-page/event-info-card"
import { EventPrizesCard } from "@/features/tournaments/components/tournament-player-side/event-page/event-prizes-card"
import { EventRegistrationCard } from "@/features/tournaments/components/tournament-player-side/event-page/event-registration-card"
import { PaymentProofDialog } from "@/features/tournaments/components/tournament-player-side/event-page/payment-proof-dialog"
import { RegisterConfirmDialog } from "@/features/tournaments/components/tournament-player-side/event-page/register-confirm-dialog"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

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
}

export function EventDetailClient({
  tournament,
  event,
  prizes = [],
  registrations = [],
  currentUser,
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

        {/* Main Grid */}
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
