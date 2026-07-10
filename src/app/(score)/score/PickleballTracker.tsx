"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"

import { CourtControls } from "@/features/score/components/CourtControls"
import { PickleballCourt } from "@/features/score/components/PickleballCourt"
import { ScoreBoard } from "@/features/score/components/ScoreBoard"
import { ScoreControls } from "@/features/score/components/ScoreControls"
import { ScoreFooter } from "@/features/score/components/ScoreFooter"
import { SpectatorWaiting } from "@/features/score/components/SpectatorWaiting"
import { StartMatchControls } from "@/features/score/components/StartMatchControls"
import { SyncOverlay } from "@/features/score/components/SyncOverlay"
import { WinnerBanner } from "@/features/score/components/WinnerBanner"
import { useMatchSync } from "@/features/score/hooks/use-match-sync"
import { useScoreStore } from "@/features/score/stores/use-score-store"
import { listMyAssignmentsAction } from "@/features/tournaments/actions/referee-actions"
import { updateFixtureResultAction } from "@/features/tournaments/actions/schedule-actions"
import { getTeamEventsAction } from "@/features/tournaments/actions/team-actions"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

function PickleballTracker() {
  const { t } = useTournamentTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()

  const matchId = searchParams.get("matchId")
  const tournamentId = searchParams.get("tournamentId")
  const team1Param = searchParams.get("team1")
  const team2Param = searchParams.get("team2")

  const isMatchServiceMatch = !!(
    matchId &&
    matchId.includes("-") &&
    matchId.length === 36
  )

  // Retrieve states and actions from Zustand store
  const {
    teamAName,
    teamBName,
    teamAScore,
    teamBScore,
    gameTarget,
    initialize,
    setTeamNames,
    setPlayerNames,
    setPlayerIds,
    matchStatus,
    setIsSaving,
    isSaving,
  } = useScoreStore()

  useMatchSync(matchId, isMatchServiceMatch)

  // Initialize store state
  useEffect(() => {
    initialize({
      team1: team1Param,
      team2: team2Param,
      defaultTeam1Label: t("referee.tracker.teamADefault"),
      defaultTeam2Label: t("referee.tracker.teamBDefault"),
      isMatchServiceMatch,
    })
  }, [team1Param, team2Param, isMatchServiceMatch, initialize, t])

  // Load match assignment and team details
  useEffect(() => {
    if (!matchId || !tournamentId) return

    const loadMatchAndTeamDetails = async () => {
      try {
        const assignmentsRes = await listMyAssignmentsAction(tournamentId)
        if (assignmentsRes.success && assignmentsRes.data) {
          const matchObj = assignmentsRes.data.find(
            (m) =>
              String(m.id) === String(matchId) ||
              (m.externalMatchId &&
                String(m.externalMatchId) === String(matchId))
          )
          if (matchObj) {
            const teamsRes = await getTeamEventsAction(
              matchObj.eventId,
              tournamentId
            )
            if (teamsRes.success && teamsRes.data) {
              const team1Obj = teamsRes.data.find(
                (t) => String(t.id) === String(matchObj.team1Id)
              )
              const team2Obj = teamsRes.data.find(
                (t) => String(t.id) === String(matchObj.team2Id)
              )

              if (team1Obj && team2Obj) {
                const t1Name = team1Obj.player2
                  ? `${team1Obj.player1.name} / ${team1Obj.player2.name}`
                  : team1Obj.player1.name
                const t2Name = team2Obj.player2
                  ? `${team2Obj.player1.name} / ${team2Obj.player2.name}`
                  : team2Obj.player1.name
                setTeamNames(t1Name, t2Name)
                setPlayerNames({
                  A1: team1Obj.player1.name || "A1",
                  A2: team1Obj.player2?.name || "",
                  B1: team2Obj.player1.name || "B1",
                  B2: team2Obj.player2?.name || "",
                })
                setPlayerIds({
                  A1: team1Obj.player1.id ? String(team1Obj.player1.id) : "",
                  A2: team1Obj.player2?.id ? String(team1Obj.player2.id) : "",
                  B1: team2Obj.player1.id ? String(team2Obj.player1.id) : "",
                  B2: team2Obj.player2?.id ? String(team2Obj.player2.id) : "",
                })
              } else {
                if (team1Obj) {
                  const t1Name = team1Obj.player2
                    ? `${team1Obj.player1.name} / ${team1Obj.player2.name}`
                    : team1Obj.player1.name
                  setTeamNames(t1Name, teamBName)
                  setPlayerNames({
                    A1: team1Obj.player1.name || "A1",
                    A2: team1Obj.player2?.name || "",
                  })
                  setPlayerIds({
                    A1: team1Obj.player1.id ? String(team1Obj.player1.id) : "",
                    A2: team1Obj.player2?.id ? String(team1Obj.player2.id) : "",
                    B1: "",
                    B2: "",
                  })
                }
                if (team2Obj) {
                  const t2Name = team2Obj.player2
                    ? `${team2Obj.player1.name} / ${team2Obj.player2.name}`
                    : team2Obj.player1.name
                  setTeamNames(teamAName, t2Name)
                  setPlayerNames({
                    B1: team2Obj.player1.name || "B1",
                    B2: team2Obj.player2?.name || "",
                  })
                  setPlayerIds({
                    A1: "",
                    A2: "",
                    B1: team2Obj.player1.id ? String(team2Obj.player1.id) : "",
                    B2: team2Obj.player2?.id ? String(team2Obj.player2.id) : "",
                  })
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load match or team details:", err)
      }
    }

    loadMatchAndTeamDetails()
  }, [
    matchId,
    tournamentId,
    setTeamNames,
    setPlayerNames,
    setPlayerIds,
    teamAName,
    teamBName,
  ])

  const handleConfirmScore = async () => {
    if (!matchId || !tournamentId) return

    setIsSaving(true)
    try {
      const res = await updateFixtureResultAction(tournamentId, matchId, {
        score: `${teamAScore} - ${teamBScore}`,
        status: "completed",
      })
      if (res.success) {
        toast.success(t("referee.tracker.successMessage"))
        router.push(`/tournaments/${tournamentId}?tab=referee`)
      } else {
        toast.error(res.error || t("referee.tracker.errorMessage"))
      }
    } catch (err) {
      console.error(err)
      toast.error(t("referee.tracker.unexpectedErrorMessage"))
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate if the game is completed (e.g. reaches target score, wins by 2)
  const isGameOver = useMemo(() => {
    const maxScore = Math.max(teamAScore, teamBScore)
    const minScore = Math.min(teamAScore, teamBScore)
    return maxScore >= gameTarget && maxScore - minScore >= 2
  }, [teamAScore, teamBScore, gameTarget])

  const winnerName = useMemo(() => {
    if (!isGameOver) return ""
    return teamAScore > teamBScore ? teamAName : teamBName
  }, [isGameOver, teamAScore, teamBScore, teamAName, teamBName])

  const mode = searchParams.get("mode")
  const isViewOnly = mode === "view"

  const isNotStarted =
    matchStatus.toUpperCase() === "READY" ||
    matchStatus.toUpperCase() === "SCHEDULED"

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-background p-4 font-sans text-foreground">
      <ScoreBoard />
      <PickleballCourt />

      {isViewOnly ? (
        isNotStarted ? (
          <SpectatorWaiting />
        ) : (
          isGameOver && (
            <div className="animate-fade-in flex flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-6 text-center shadow-sm dark:bg-emerald-950/20">
              <div className="text-5xl">🏆</div>
              <h3 className="text-xl font-black tracking-widest text-emerald-800 uppercase dark:text-emerald-300">
                {t("referee.tracker.gameOverTitle", {
                  defaultValue: "Trận đấu kết thúc",
                })}
              </h3>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {t("referee.tracker.winnerIs", {
                  defaultValue: `Chiến thắng: ${winnerName}`,
                  name: winnerName,
                })}
              </p>
              <div className="font-mono text-4xl font-extrabold text-neutral-800 dark:text-neutral-100">
                {teamAScore} - {teamBScore}
              </div>
            </div>
          )
        )
      ) : isNotStarted ? (
        <StartMatchControls matchId={matchId} />
      ) : isGameOver ? (
        <WinnerBanner
          winnerName={winnerName}
          teamAScore={teamAScore}
          teamBScore={teamBScore}
          isMatchServiceMatch={isMatchServiceMatch}
          matchId={matchId}
          handleConfirmScore={handleConfirmScore}
          isSaving={isSaving}
        />
      ) : (
        /* Render normal match flow controls */
        <>
          <CourtControls />
          <ScoreControls
            isMatchServiceMatch={isMatchServiceMatch}
            matchId={matchId}
          />
          <ScoreFooter
            isMatchServiceMatch={isMatchServiceMatch}
            matchId={matchId}
            tournamentId={tournamentId}
            handleConfirmScore={handleConfirmScore}
          />
        </>
      )}

      <SyncOverlay isMatchServiceMatch={isMatchServiceMatch} />
    </div>
  )
}

export function ScoreboardFallback() {
  const { t } = useTournamentTranslation()
  return (
    <div className="p-8 text-center text-gray-500">
      {t("loadingScoreboard") || "Loading scoreboard..."}
    </div>
  )
}

export default PickleballTracker
