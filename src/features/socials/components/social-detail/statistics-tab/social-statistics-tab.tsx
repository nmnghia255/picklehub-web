"use client"

import { useQueries, useQuery } from "@tanstack/react-query"
import React from "react"

import {
  getFinanceSummaryAction,
  listStatisticsAction,
} from "../../../actions/finance-actions"
import { listPlaySessionMatchesAction } from "../../../actions/match-action"
import type { PlaySession } from "../../../types/play-session"
import type { SocialDetail, SocialParticipant } from "../../../types/social"
import { SocialParticipantsTable } from "./social-participants-table"
import { SocialStatisticsCards } from "./social-statistics-cards"
import { SocialStatisticsHeader } from "./social-statistics-header"

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
  const socialId = social.id

  // 1. Fetch Finance Summary
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["financeSummary", socialId],
    queryFn: () => getFinanceSummaryAction(socialId),
    enabled: !!socialId,
  })

  // 1.5 Fetch Social Statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["socialStatistics", socialId],
    queryFn: () => listStatisticsAction(socialId),
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

  // 4. Calculate matches played for each participant, merging with backend stats if available
  const participantsWithStats = React.useMemo(() => {
    return (initialParticipants || [])
      .map((participant) => {
        // Find if we have backend API stats for this player
        const playerStat = stats?.playerStats?.find(
          (p) => p.userId === participant.userId || p.userId === participant.id
        )

        // Count matches played by participant locally as fallback
        const localMatchesCount = allMatches.filter((match) => {
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
          matchesCount: playerStat?.playedMatches ?? localMatchesCount,
          winsCount: playerStat?.totalGoals ?? 0,
        }
      })
      .sort((a, b) => b.matchesCount - a.matchesCount)
  }, [initialParticipants, allMatches, stats])

  const totalMatchesCount = React.useMemo(() => {
    return allMatches.filter(
      (m) =>
        m.status === "COMPLETED" ||
        m.status === "LIVE" ||
        !!m.winner ||
        (m.sets && m.sets.length > 0)
    ).length
  }, [allMatches])

  if (isLoadingSummary || isLoadingMatches || isLoadingStats) {
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

  const displayMatchesCount = stats?.totalMatches ?? totalMatchesCount
  const displayActivePlayers =
    stats?.activePlayers ??
    participantsWithStats.filter((p) => p.matchesCount > 0).length

  return (
    <div className="space-y-6">
      {/* Dashboard Header Banner */}
      <SocialStatisticsHeader />

      {/* Metric Cards Section (organized in 2 rows of 3 columns) */}
      <SocialStatisticsCards
        collectedRevenue={collectedRevenue}
        totalExpectedRevenue={totalExpectedRevenue}
        outstandingAmount={outstandingAmount}
        totalExpense={totalExpense}
        estimatedProfit={estimatedProfit}
        displayMatchesCount={displayMatchesCount}
        displayActivePlayers={displayActivePlayers}
        courtHours={stats?.courtHours}
      />

      {/* Participants Summary Section */}
      <SocialParticipantsTable participants={participantsWithStats} />
    </div>
  )
}
