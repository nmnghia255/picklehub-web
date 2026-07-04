"use client"

import { Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Player } from "../../../types/player"

interface ParticipantsTabProps {
  participants: Player[]
  hideEvent?: boolean
}

export function ParticipantsTab({
  participants,
  hideEvent = false,
}: ParticipantsTabProps) {
  const { t } = useTournamentTranslation()

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          {t("public.tabs.participants")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!participants || participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/30 px-4 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/20">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
              {t("public.noParticipantsYet", {
                defaultValue: "No participants registered yet",
              })}
            </h3>
            <p className="mt-1 max-w-xs text-xs text-gray-500">
              {t("public.participantsList.emptyHint", {
                defaultValue: "Be the first to register and join the action!",
              })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {participants.map((participant, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-sm"
              >
                <Avatar className="h-10 w-10 border border-emerald-100">
                  <AvatarFallback className="bg-emerald-50 font-bold text-emerald-700">
                    {participant.avatar ||
                      participant.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold text-gray-900">
                    {participant.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-gray-500">
                    <span>{t("public.participantsList.rating")}</span>
                    <span className="font-bold text-emerald-600">
                      {participant.rating}
                    </span>
                    {participant.event && !hideEvent && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="truncate">{participant.event}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
