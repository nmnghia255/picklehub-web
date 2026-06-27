"use client"

import { ArrowLeft, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Tournament } from "../../../types/tournament"
import type { TournamentEvent } from "../../../types/tournament-event"

interface EventHeroProps {
  tournament: Tournament
  event: TournamentEvent
}

export function EventHero({ tournament, event }: EventHeroProps) {
  const { t } = useTournamentTranslation()

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 p-8 text-white shadow-lg">
      <div className="absolute top-0 right-0 h-40 w-40 translate-x-12 -translate-y-12 rounded-full bg-emerald-700/20 blur-2xl" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative">
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
            {tournament.name}
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
            {event.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-white/85">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-400" />
              {tournament.venue}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-emerald-400" />
              {new Date(tournament.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <Link
            href={`/tournament/${tournament.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("eventDetail.backToTournament", {
              defaultValue: "Back to Tournament Details",
            })}
          </Link>
        </div>
      </div>
    </div>
  )
}
