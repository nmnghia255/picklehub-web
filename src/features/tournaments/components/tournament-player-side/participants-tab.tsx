"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { Player } from "../../types/player"

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
      </CardContent>
    </Card>
  )
}
