import { Calendar, Mail, Phone, Trash2 } from "lucide-react"
import { useMemo } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { cn } from "@/lib/utils"

import { usePersonnelStore } from "../../stores/use-personnel-store"
import type { Referee } from "../../types/referee"

interface RefereeProfileCardProps {
  referee: Referee
  onUnenroll?: (referee: Referee) => void
  className?: string
}

export function RefereeProfileCard({
  referee,
  onUnenroll,
  className,
}: RefereeProfileCardProps) {
  const { t } = useTournamentTranslation()
  const referees = usePersonnelStore((s) => s.referees)
  const workload = referee.workload || 0

  const maxWorkload = useMemo(() => {
    if (!referees || referees.length === 0) return 5
    return Math.max(...referees.map((r) => r.workload || 0), 5)
  }, [referees])

  const percentage = useMemo(() => {
    return Math.min((workload / maxWorkload) * 100, 100)
  }, [workload, maxWorkload])

  // Color coding based on workload intensity relative to maximum capacity
  const { barColor, textColor } = useMemo(() => {
    if (workload === 0) {
      return {
        barColor: "bg-gray-300 dark:bg-zinc-700",
        textColor: "text-gray-500 dark:text-zinc-400",
      }
    }
    if (workload >= maxWorkload * 0.8) {
      return {
        barColor: "bg-rose-500", // near or at maximum workload
        textColor: "text-rose-700 dark:text-rose-400 font-semibold",
      }
    }
    if (workload >= maxWorkload * 0.5) {
      return {
        barColor: "bg-amber-500", // moderate workload
        textColor: "text-amber-700 dark:text-amber-400",
      }
    }
    return {
      barColor: "bg-emerald-500", // low workload
      textColor: "text-emerald-700 dark:text-emerald-400",
    }
  }, [workload, maxWorkload])

  return (
    <Card
      className={cn(
        "group gap-0 overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start gap-4 pb-4">
        <Avatar className="h-14 w-14 rounded-xl border border-gray-100 shadow-xs">
          <AvatarImage src={referee.refereeAvatar} alt={referee.refereeName} />
          <AvatarFallback className="rounded-xl bg-emerald-50 text-lg font-semibold text-emerald-700">
            {referee.refereeName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="truncate text-base font-semibold text-gray-900">
              {referee.refereeName}
            </CardTitle>
            {onUnenroll && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                onClick={() => onUnenroll(referee)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Badge
            variant="outline"
            className="cursor-help border-gray-200 bg-gray-50 px-2 py-0 font-mono text-[10px] text-gray-600"
            title={referee.refereeId}
          >
            {t("personnel.roster.idLabel")}:{" "}
            {referee.refereeId.length > 30
              ? `${referee.refereeId.substring(0, 16)}...${referee.refereeId.substring(referee.refereeId.length - 12)}`
              : referee.refereeId}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{referee.refereeEmail}</span>
          </div>
          {referee.phone ? (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span>{referee.phone}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span>{t("referee.notUpdate")}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span>
              {t("personnel.roster.enrolledDate", {
                date: new Date(referee.enrolledAt).toLocaleDateString("vi-VN"),
              })}
            </span>
          </div>
        </div>

        {/* Workload Indicator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-500">
              {t("personnel.roster.workload")}
            </span>
            <span className={cn("font-semibold", textColor)}>
              {t("personnel.roster.matchesCount", {
                count: workload,
              })}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                barColor
              )}
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
