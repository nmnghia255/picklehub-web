"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Match } from "@/features/matches/types"
import { useProfileTranslation } from "@/i18n/use-profile-translation"
import { cn } from "@/lib/utils"

interface MatchHistoryProps {
  matches: Match[]
  currentUserId: string
}

function formatDate(value: string, locale: string = "en"): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  const formatLocale = locale === "vi" ? "vi-VN" : "en-US"
  return new Intl.DateTimeFormat(formatLocale, {
    month: "short",
    day: "2-digit",
  }).format(date)
}

function formatScore(match: Match): string {
  if (Array.isArray(match.sets) && match.sets.length > 0) {
    return match.sets.map((set) => `${set[0]}-${set[1]}`).join(", ")
  }

  return `${match.scoreA}-${match.scoreB}`
}

function getMemberId(member: unknown): string {
  if (!member) return ""
  if (typeof member === "string") return member
  if (typeof member === "object" && member !== null) {
    const obj = member as Record<string, unknown>
    const id = obj.id || obj.userId
    if (typeof id === "string") return id
  }
  return ""
}

function getMemberName(member: unknown): string {
  if (!member) return ""
  if (typeof member === "string") {
    return member.length === 36 ? member.slice(0, 8) : member
  }
  if (typeof member === "object" && member !== null) {
    const obj = member as Record<string, unknown>
    const name = obj.fullName || obj.name
    if (typeof name === "string") return name
    const id = obj.id || obj.userId
    if (typeof id === "string") {
      return id.slice(0, 8)
    }
  }
  return ""
}

function getOpponentLabel(
  match: Match,
  currentUserId: string,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const teamAIds = match.teamA.map(getMemberId)
  const isInTeamA = teamAIds.includes(currentUserId)
  const opponentTeam = isInTeamA ? match.teamB : match.teamA

  if (!Array.isArray(opponentTeam) || opponentTeam.length === 0) {
    return t("unknown")
  }

  if (opponentTeam.length === 1) {
    const opponentName = getMemberName(opponentTeam[0])
    return opponentName ? t("unknownUser", { id: opponentName }) : t("unknown")
  }

  return t("teamSize", { count: opponentTeam.length })
}

type MatchResultType = "WIN" | "LOSS" | "DRAW" | "CANCELLED" | "UNCONFIRMED"

function getResult(match: Match, currentUserId: string): MatchResultType {
  if (match.winner === "DRAW") {
    return "DRAW"
  }

  if (!match.winner) {
    if (match.status === "CANCELLED") {
      return "CANCELLED"
    }

    return "UNCONFIRMED"
  }

  const teamAIds = match.teamA.map(getMemberId)
  const isInTeamA = teamAIds.includes(currentUserId)
  const won =
    (isInTeamA && match.winner === "TEAM_A") ||
    (!isInTeamA && match.winner === "TEAM_B")

  return won ? "WIN" : "LOSS"
}

function getResultLabel(
  result: MatchResultType,
  t: (key: string) => string
): string {
  switch (result) {
    case "WIN":
      return t("wins")
    case "LOSS":
      return t("losses")
    case "DRAW":
      return t("draw")
    case "CANCELLED":
      return t("cancelled")
    case "UNCONFIRMED":
      return t("unconfirmed")
    default:
      return t("unknown")
  }
}

function getResultClassName(result: MatchResultType): string {
  switch (result) {
    case "WIN":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
    case "LOSS":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
    case "DRAW":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
    case "UNCONFIRMED":
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
    case "CANCELLED":
    default:
      return "bg-muted/50 text-muted-foreground border border-border"
  }
}

export function MatchHistory({ matches, currentUserId }: MatchHistoryProps) {
  const { t, i18n } = useProfileTranslation()

  return (
    <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow">
      <h3 className="mb-4 font-semibold">{t("recentMatches")}</h3>
      <Table className="text-left">
        <TableHeader>
          <TableRow className="text-sm text-muted-foreground hover:bg-transparent">
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("opponent")}</TableHead>
            <TableHead>{t("result")}</TableHead>
            <TableHead>{t("score")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                {t("noMatches")}
              </TableCell>
            </TableRow>
          ) : (
            matches.map((match) => {
              const resultKey = getResult(match, currentUserId)
              return (
                <TableRow key={match.id}>
                  <TableCell>
                    {formatDate(match.scheduledAt, i18n.language)}
                  </TableCell>
                  <TableCell>
                    {getOpponentLabel(match, currentUserId, t)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                        getResultClassName(resultKey)
                      )}
                    >
                      {getResultLabel(resultKey, t)}
                    </span>
                  </TableCell>
                  <TableCell>{formatScore(match)}</TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
