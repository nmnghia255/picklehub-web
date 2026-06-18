"use client"

import { useQueries, useQuery } from "@tanstack/react-query"
import { Activity, Coins, Medal, TrendingUp, Trophy } from "lucide-react"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import { getFinanceSummaryAction } from "../../../actions/finance-actions"
import { listPlaySessionMatchesAction } from "../../../actions/match-action"
import type { PlaySession } from "../../../types/play-session"
import type { SocialDetail, SocialParticipant } from "../../../types/social"

interface SocialStatisticsTabProps {
  social: SocialDetail
  initialParticipants: SocialParticipant[]
  playSessions: PlaySession[]
}

export default function SocialStatisticsTab({
  social,
  initialParticipants,
  playSessions,
}: SocialStatisticsTabProps) {
  const { t } = useSocialsTranslation()
  const socialId = social.id

  // 1. Fetch Finance Summary
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["financeSummary", socialId],
    queryFn: () => getFinanceSummaryAction(socialId),
    enabled: !!socialId,
  })

  // 2. Fetch matches for all play sessions in parallel
  const playSessionQueries = useQueries({
    queries: (playSessions || []).map((session) => ({
      queryKey: ["playSessionMatches", session.id],
      queryFn: () => listPlaySessionMatchesAction(session.id),
      enabled: !!session.id,
    })),
  })

  const isLoadingMatches = playSessionQueries.some((q) => q.isLoading)

  // 3. Aggregate all matches across all sessions
  const allMatches = React.useMemo(() => {
    return playSessionQueries.flatMap((q) => q.data?.items || [])
  }, [playSessionQueries])

  // 4. Calculate matches played for each participant
  const participantsWithStats = React.useMemo(() => {
    return (initialParticipants || [])
      .map((participant) => {
        // Count matches played by participant
        const matchesCount = allMatches.filter((match) => {
          const inTeamA = (match.teamA || []).some(
            (player) =>
              player.id === participant.id || player.id === participant.userId
          )
          const inTeamB = (match.teamB || []).some(
            (player) =>
              player.id === participant.id || player.id === participant.userId
          )

          // Only count matches that have a status indicating they were played (e.g. COMPLETED or LIVE or has winner/sets)
          const isPlayed =
            match.status === "COMPLETED" ||
            match.status === "LIVE" ||
            !!match.winner ||
            (match.sets && match.sets.length > 0)

          return isPlayed && (inTeamA || inTeamB)
        }).length

        return {
          ...participant,
          matchesCount,
        }
      })
      .sort((a, b) => b.matchesCount - a.matchesCount)
  }, [initialParticipants, allMatches])

  const totalMatchesCount = React.useMemo(() => {
    return allMatches.filter(
      (m) =>
        m.status === "COMPLETED" ||
        m.status === "LIVE" ||
        !!m.winner ||
        (m.sets && m.sets.length > 0)
    ).length
  }, [allMatches])

  if (isLoadingSummary || isLoadingMatches) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    )
  }

  // Fallback financial details if summary API call fails or is empty
  const totalExpense = summary?.totalExpense ?? social.totalExpense ?? 0
  const collectedRevenue = summary?.collectedAmount ?? 0
  const totalExpectedRevenue = summary?.totalExpectedRevenue ?? 0
  const outstandingAmount = summary?.outstandingAmount ?? 0
  const estimatedProfit =
    summary?.estimatedProfit ?? collectedRevenue - totalExpense

  // Map skill level rating to appropriate colors (Tailwind HSL styles)
  const getSkillLevelTone = (rating?: number | null) => {
    if (!rating) return "border-muted/30 bg-muted/10 text-muted-foreground"
    if (rating < 2.5)
      return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
    if (rating < 3.5)
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    if (rating < 4.5)
      return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header Banner */}
      <Card className="overflow-hidden border-primary/10 bg-linear-to-br from-background via-background to-primary/5 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("statistics.title", { defaultValue: "Post-Event Statistics" })}
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              {t("statistics.subtitle", {
                defaultValue:
                  "Review matches played, total expenses, and actual revenue earned for this completed social.",
              })}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Grid of Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Spent Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
          <div className="pointer-events-none absolute -top-6 -right-6 opacity-5">
            <Coins className="size-24 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {t("statistics.revenue", { defaultValue: "Revenue Earned" })}
            </p>
            <Coins className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrencyVnd(collectedRevenue)}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span>
                {t("statistics.expected", { defaultValue: "Expected" })}:
              </span>
              <span className="font-semibold text-foreground">
                {formatCurrencyVnd(totalExpectedRevenue)}
              </span>
            </div>
            {outstandingAmount > 0 && (
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <span>
                  {t("statistics.outstanding", { defaultValue: "Outstanding" })}
                  :
                </span>
                <span className="font-semibold">
                  {formatCurrencyVnd(outstandingAmount)}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Expense Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
          <div className="pointer-events-none absolute -top-6 -right-6 opacity-5">
            <TrendingUp className="size-24 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {t("statistics.expense", { defaultValue: "Expense Spent" })}
            </p>
            <TrendingUp className="size-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrencyVnd(totalExpense)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("expenses.summary.totalExpenseDescription", {
                defaultValue: "All court bookings added to the social event",
              })}
            </p>
          </div>
        </Card>

        {/* Net Profit Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
          <div className="pointer-events-none absolute -top-6 -right-6 opacity-5">
            <Trophy className="size-24 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {t("statistics.profit", { defaultValue: "Net Profit" })}
            </p>
            <Trophy
              className={`size-4 ${estimatedProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
            />
          </div>
          <div className="mt-2">
            <p
              className={`text-2xl font-bold tracking-tight ${estimatedProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
            >
              {formatCurrencyVnd(estimatedProfit)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {estimatedProfit >= 0
                ? t("statistics.estimated", {
                    defaultValue: "Estimated Profit",
                  })
                : t("statistics.estimatedLoss", {
                    defaultValue: "Estimated Loss",
                  })}
            </p>
          </div>
        </Card>

        {/* Total Matches Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
          <div className="pointer-events-none absolute -top-6 -right-6 opacity-5">
            <Activity className="size-24 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {t("statistics.totalMatches", { defaultValue: "Total Matches" })}
            </p>
            <Activity className="size-4 text-primary" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {totalMatchesCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("matches.statistics.playerMatchesTitle", {
                defaultValue: "Matches by player",
              })}
            </p>
          </div>
        </Card>
      </div>

      {/* Participants Summary Section */}
      <Card className="border-border/60 bg-card/40 shadow-sm backdrop-blur">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {t("statistics.participants", {
                  defaultValue: "Participants Summary",
                })}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t("matches.statistics.playerMatchesTitle", {
                  defaultValue: "Matches played by each participant",
                })}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 px-3 py-1 font-semibold"
            >
              <Medal className="size-3.5 text-primary" />
              {participantsWithStats.length}{" "}
              {t("statistics.playersCount", { defaultValue: "Players" })}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[45%] py-3.5 pl-6 font-semibold">
                    {t("statistics.headers.participant", {
                      defaultValue: "Participant",
                    })}
                  </TableHead>
                  <TableHead className="w-[25%] py-3.5 text-center font-semibold">
                    {t("statistics.headers.level", { defaultValue: "Level" })}
                  </TableHead>
                  <TableHead className="w-[30%] py-3.5 pr-6 text-right font-semibold">
                    {t("statistics.headers.matchesPlayed", {
                      defaultValue: "Matches Played",
                    })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participantsWithStats.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      {t("detail.noParticipants", {
                        defaultValue: "No participants yet.",
                      })}
                    </TableCell>
                  </TableRow>
                ) : (
                  participantsWithStats.map((participant) => {
                    const rating = participant.user?.selfRating
                    const displayName =
                      participant.user?.name || "Unknown Player"

                    return (
                      <TableRow
                        key={participant.id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        {/* Participant profile details */}
                        <TableCell className="py-3.5 pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 border border-border/80">
                              <AvatarImage
                                src={participant.user?.avatarUrl ?? undefined}
                                alt={displayName}
                              />
                              <AvatarFallback className="bg-muted font-medium text-muted-foreground">
                                {displayName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {displayName}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {participant.user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Level badge */}
                        <TableCell className="py-3.5 text-center">
                          <Badge
                            variant="outline"
                            className={`px-2.5 py-0.5 text-xs font-semibold ${getSkillLevelTone(rating)}`}
                          >
                            {rating !== undefined && rating !== null
                              ? `${t("common.level", { defaultValue: "Level" })} ${rating.toFixed(1)}`
                              : t("common.na", { defaultValue: "N/A" })}
                          </Badge>
                        </TableCell>

                        {/* Matches Played Count */}
                        <TableCell className="py-3.5 pr-6 text-right">
                          <Badge
                            variant={
                              participant.matchesCount > 0
                                ? "secondary"
                                : "outline"
                            }
                            className={`px-3 py-1 font-semibold ${participant.matchesCount > 0 ? "bg-primary/10 text-primary hover:bg-primary/10" : "text-muted-foreground"}`}
                          >
                            {participant.matchesCount}{" "}
                            {participant.matchesCount === 1
                              ? t("matches.type.match", {
                                  defaultValue: "Match",
                                })
                              : t("matches.matrix.count_other", {
                                  defaultValue: "Matches",
                                }).toLowerCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
