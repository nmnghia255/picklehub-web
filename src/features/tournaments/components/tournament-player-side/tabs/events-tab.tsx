import { Award, ShieldAlert, Users } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import type { TournamentEvent } from "../../../types/tournament-event"

interface EventsTabProps {
  tournamentId: string
  events?: TournamentEvent[]
}

export function EventsTab({ tournamentId, events = [] }: EventsTabProps) {
  const { t } = useTournamentTranslation()

  return (
    <div className="space-y-6">
      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed border-gray-200 bg-white p-12 text-center">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg font-semibold text-gray-600">
            {t("events.noEventsFound", { defaultValue: "No events found" })}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((evt) => {
            const registeredSlots = evt.participants || 0
            const maxCapacity = evt.capacity || 32
            const percentage = Math.min(
              100,
              Math.round((registeredSlots / maxCapacity) * 100)
            )
            const isFull = registeredSlots >= maxCapacity

            return (
              <Link
                key={evt.id}
                href={`/tournaments/${tournamentId}/event/${evt.id}`}
                className="block"
              >
                <Card className="relative h-full cursor-pointer overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                  {/* Visual Accent Bar */}
                  <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-600" />

                  <CardContent className="flex flex-col gap-2 px-6 py-2">
                    {/* Category Badges */}
                    <div className="mb-3 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="border border-emerald-100 bg-emerald-50 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                      >
                        {t(`events.dialog.types.${evt.type.toLowerCase()}`, {
                          defaultValue: evt.type,
                        })}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-xs font-semibold text-blue-800"
                      >
                        {t(
                          `events.dialog.genders.${evt.gender.toLowerCase()}`,
                          { defaultValue: evt.gender }
                        )}
                      </Badge>
                      <Badge
                        className={`ml-auto text-xs font-bold ${
                          isFull
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-100"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {isFull
                          ? t("events.table.statusFull", {
                              defaultValue: "FULL",
                            })
                          : t("events.table.statusOpen", {
                              defaultValue: "OPEN",
                            })}
                      </Badge>
                    </div>

                    {/* Title & DUPR */}
                    <h3 className="mb-1 line-clamp-1 text-xl font-bold text-gray-900">
                      {evt.name}
                    </h3>
                    <p className="mb-5 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                      <Award className="h-4 w-4" />
                      {t(
                        `events.dialog.skills.${evt.skillRange.toLowerCase()}`,
                        {
                          defaultValue: evt.skillRange,
                        }
                      )}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-2 space-y-4">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Users className="h-3.5 w-3.5" />
                          {t("events.table.participants", {
                            defaultValue: "Participants",
                          })}
                        </span>
                        <span className="text-gray-900">
                          {registeredSlots} / {maxCapacity}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFull ? "bg-slate-400" : "bg-emerald-600"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Fee Footer */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                      <span className="text-xs font-medium text-gray-500">
                        {t("events.table.entryFee", {
                          defaultValue: "Entry Fee",
                        })}
                      </span>
                      <span className="text-base font-extrabold text-gray-900">
                        {evt.entryFee
                          ? `${evt.entryFee.toLocaleString()} VND`
                          : "Free"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
