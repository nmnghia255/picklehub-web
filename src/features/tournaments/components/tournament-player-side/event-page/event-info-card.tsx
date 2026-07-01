"use client"

import { Award, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentEvent } from "../../../types/tournament-event"

interface EventInfoCardProps {
  event: TournamentEvent
}

export function EventInfoCard({ event }: EventInfoCardProps) {
  const { t } = useTournamentTranslation()

  const registeredCount = event.participants || 0
  const maxCapacity = event.capacity || 32
  const isFull = registeredCount >= maxCapacity

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          {t("eventDetail.eventInfo", { defaultValue: "Event Information" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-100/50 bg-gray-200/70 p-4">
            <div className="text-md block font-semibold text-gray-500">
              {t("eventDetail.format", { defaultValue: "Format" })}
            </div>
            <div className="mt-1 block text-lg font-black text-gray-900">
              {t(`events.dialog.types.${event.type.toLowerCase()}`, {
                defaultValue: event.type,
              })}
            </div>
          </div>
          <div className="rounded-lg border border-gray-100/50 bg-gray-200/70 p-4">
            <span className="text-md block font-semibold text-gray-500">
              {t("eventDetail.genderCategory", {
                defaultValue: "Gender Category",
              })}
            </span>
            <span className="mt-1 block text-lg font-black text-gray-900">
              {t(`events.dialog.genders.${event.gender.toLowerCase()}`, {
                defaultValue: event.gender,
              })}
            </span>
          </div>
          <div className="rounded-lg border border-gray-100/50 bg-gray-200/70 p-4">
            <span className="text-md block font-semibold text-gray-500">
              {t("eventDetail.duprSkillRange", {
                defaultValue: "DUPR Skill Range",
              })}
            </span>
            <span className="mt-1.5 flex items-center gap-1.5 text-lg font-black text-emerald-700">
              <Award className="h-5 w-5 text-emerald-600" />
              {t(`events.dialog.skills.${event.skillRange.toLowerCase()}`, {
                defaultValue: event.skillRange,
              })}
            </span>
          </div>
          <div className="rounded-lg border border-gray-100/50 bg-gray-200/70 p-4">
            <span className="text-md block font-semibold text-gray-500">
              {t("eventDetail.capacity", { defaultValue: "Capacity" })}
            </span>
            <span className="mt-1.5 flex items-center gap-1.5 text-lg font-black text-gray-900">
              <Users className="h-5 w-5 text-gray-500" />
              {t("eventDetail.slots", {
                count: registeredCount,
                capacity: maxCapacity,
                defaultValue: `${registeredCount} / ${maxCapacity} Slots`,
              })}
            </span>
          </div>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFull ? "bg-slate-400" : "bg-emerald-600"
            }`}
            style={{
              width: `${Math.min(100, (registeredCount / maxCapacity) * 100)}%`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
