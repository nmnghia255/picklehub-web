import { Shield } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import type { Referee } from "../../types/referee"

interface RefereeListProps {
  referees: Referee[]
  selectedRefereeId: string | null
  onSelectReferee: (id: string) => void
}

export function RefereeList({
  referees,
  selectedRefereeId,
  onSelectReferee,
}: RefereeListProps) {
  const { t } = useTournamentTranslation()

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs md:col-span-1">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
          <Shield className="h-4.5 w-4.5 text-emerald-600" />
          {t("personnel.assignments.refereesListTitle", {
            defaultValue: "Referees List",
          })}
        </h3>
        <Badge
          variant="outline"
          className="bg-gray-50 font-medium text-gray-500"
        >
          {referees.length}
        </Badge>
      </div>

      <div className="max-h-[600px] divide-y divide-gray-100 overflow-y-auto">
        {referees.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {t("personnel.roster.emptyTitle")}
          </div>
        ) : (
          referees.map((ref) => (
            <button
              key={ref.refereeId}
              onClick={() => onSelectReferee(ref.refereeId)}
              className={cn(
                "flex w-full items-center gap-3 p-4 text-left transition-all hover:bg-gray-50/50 focus:outline-hidden",
                selectedRefereeId === ref.refereeId
                  ? "border-l-4 border-l-emerald-600 bg-emerald-50/40"
                  : "border-l-4"
              )}
            >
              <Avatar className="h-10 w-10 shrink-0 border border-gray-200">
                <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-800">
                  {ref.refereeName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="truncate text-sm font-semibold text-gray-900">
                    {ref.refereeName}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "px-1.5 py-0 text-[10px] font-medium",
                      ref.workload > 0
                        ? "border-emerald-100 text-emerald-800"
                        : "border-transparent bg-gray-100 text-gray-500"
                    )}
                  >
                    {t("personnel.roster.matchesCount", {
                      count: ref.workload,
                    })}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {ref.refereeEmail}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
