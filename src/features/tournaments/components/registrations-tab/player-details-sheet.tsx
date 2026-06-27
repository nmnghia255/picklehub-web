"use client"

import { ExternalLink } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Player } from "../../types/player"
import type { RegistrationResponse } from "../../types/registration"

interface PlayerDetailsSheetProps {
  registration: RegistrationResponse | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function PlayerAvatar({
  player,
  className,
}: {
  player: Player
  className?: string
}) {
  const initials = player.name
    ? player.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  const isUrl =
    player.avatar &&
    (player.avatar.startsWith("http://") ||
      player.avatar.startsWith("https://") ||
      player.avatar.startsWith("/"))

  return (
    <Avatar className={className}>
      {isUrl && <AvatarImage src={player.avatar} alt={player.name} />}
      <AvatarFallback className="bg-emerald-100 text-emerald-700">
        {isUrl ? initials : player.avatar || initials}
      </AvatarFallback>
    </Avatar>
  )
}

export function PlayerDetailsSheet({
  registration,
  isOpen,
  onOpenChange,
}: PlayerDetailsSheetProps) {
  const { t } = useTournamentTranslation()

  if (!registration) return null

  const {
    player,
    partner,
    event,
    registrationDate,
    paymentStatus,
    paymentProofUrl,
  } = registration
  const isPaid = paymentStatus === "completed" || paymentStatus === "paid"

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("registrations.profile.title")}</SheetTitle>
          <SheetDescription>
            {t("registrations.profile.description")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Player profile summary */}
          <div className="text-center">
            <PlayerAvatar player={player} className="mx-auto mb-3 h-20 w-20" />
            <h3 className="text-xl font-semibold text-gray-900">
              {player.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t("registrations.profile.duprRating", { rating: player.rating })}
            </p>
          </div>

          {/* Registration Details */}
          <div className="border-t border-gray-100 pt-6">
            <h4 className="mb-3 text-sm font-semibold tracking-wider text-gray-900 uppercase">
              {t("registrations.profile.registrationDetails")}
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  {t("registrations.profile.event")}
                </span>
                <span className="font-medium text-gray-900">{event}</span>
              </div>
              {partner && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    {t("registrations.table.partner")}
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-gray-900">
                    <PlayerAvatar player={partner} className="h-5 w-5" />
                    <span>{partner.name}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">
                  {t("registrations.profile.registrationDate")}
                </span>
                <span className="font-medium text-gray-900">
                  {registrationDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">
                  {t("registrations.profile.paymentStatus")}
                </span>
                <Badge
                  className={
                    isPaid
                      ? "border-none bg-emerald-100 text-emerald-700 shadow-none hover:bg-emerald-100"
                      : "border-none bg-yellow-100 text-yellow-700 shadow-none hover:bg-yellow-100"
                  }
                >
                  {isPaid
                    ? t("registrations.table.paid")
                    : t("registrations.table.pending")}
                </Badge>
              </div>

              {/* Payment Proof rendering */}
              {paymentProofUrl && (
                <div className="mt-2 flex items-start justify-between border-t border-dashed border-gray-100 pt-2">
                  <span className="text-gray-500">
                    {t("registrations.paymentProof", {
                      defaultValue: "Payment Proof",
                    })}
                  </span>
                  <a
                    href={paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                  >
                    {t("registrations.viewProof", {
                      defaultValue: "View Proof",
                    })}{" "}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Match History (Mock statistics for layout) */}
          <div className="border-t border-gray-100 pt-6">
            <h4 className="mb-3 text-sm font-semibold tracking-wider text-gray-900 uppercase">
              {t("registrations.profile.matchHistory")}
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-medium text-gray-800">
                {t("registrations.profile.historyStats", {
                  wins: 23,
                  losses: 15,
                })}
              </p>
              <p className="text-xs text-gray-500">
                {t("registrations.profile.previousTournaments", {
                  count: 5,
                })}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
