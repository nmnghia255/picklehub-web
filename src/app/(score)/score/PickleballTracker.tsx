"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { BackButton } from "@/components/common/back-button"
import { Button } from "@/components/ui/button"
import {
  confirmMatchResultAction,
  getMatchDetailsAction,
} from "@/features/matches/actions"
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
import { useScoreTranslation } from "@/i18n/use-score-translation"

function PickleballTracker() {
  const { t } = useScoreTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()

  const matchId = searchParams.get("matchId")
  const tournamentId = searchParams.get("tournamentId")
  const team1Param = searchParams.get("team1")
  const team2Param = searchParams.get("team2")

  const [showTossWizard, setShowTossWizard] = useState(false)

  const isMatchServiceMatch = !!(
    matchId &&
    matchId.includes("-") &&
    matchId.length === 36
  )

  const mode = searchParams.get("mode")
  const isViewOnly = mode === "view"

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
    sets,
    currentSetId,
    startNextSet,
    handleUndo,
    setsToWin,
  } = useScoreStore()

  useMatchSync(matchId, isMatchServiceMatch, isViewOnly)

  const initializedMatchServiceRef = useRef(false)

  // Initialize store state
  useEffect(() => {
    // For match-service matches, we only want to initialize the store once.
    // Subsequent updates to the query parameters (e.g. due to Next.js routing hydration)
    // should not reset the score and other states, since they are managed by the server.
    if (isMatchServiceMatch) {
      if (initializedMatchServiceRef.current) return
      initializedMatchServiceRef.current = true
    }

    initialize({
      team1: team1Param,
      team2: team2Param,
      defaultTeam1Label: t("tracker.teamADefault"),
      defaultTeam2Label: t("tracker.teamBDefault"),
      isMatchServiceMatch,
      isViewOnly,
    })
  }, [team1Param, team2Param, isMatchServiceMatch, isViewOnly, initialize])

  // Load match assignment and team details
  useEffect(() => {
    if (!matchId) return

    const loadMatchAndTeamDetails = async () => {
      try {
        if (isViewOnly || isMatchServiceMatch) {
          const matchRes = await getMatchDetailsAction(matchId)
          if (matchRes.success && matchRes.data) {
            const matchData = matchRes.data
            type PlayerInput =
              | string
              | { id: string; fullName?: string | null; name?: string | null }
              | null
              | undefined
            const getPlayerName = (p: PlayerInput) => {
              if (!p) return ""
              if (typeof p === "string") return p
              return p.fullName || p.name || ""
            }
            const getPlayerId = (p: PlayerInput) => {
              if (!p || typeof p === "string") return ""
              return String(p.id || "")
            }

            const pA1 = matchData.teamA?.[0]
            const pA2 = matchData.teamA?.[1]
            const pB1 = matchData.teamB?.[0]
            const pB2 = matchData.teamB?.[1]

            const t1Name = pA2
              ? `${getPlayerName(pA1)} / ${getPlayerName(pA2)}`
              : getPlayerName(pA1)
            const t2Name = pB2
              ? `${getPlayerName(pB1)} / ${getPlayerName(pB2)}`
              : getPlayerName(pB1)

            setTeamNames(
              t1Name || t("tracker.teamADefault", { defaultValue: "Đội A" }),
              t2Name || t("tracker.teamBDefault", { defaultValue: "Đội B" })
            )
            setPlayerNames({
              A1: getPlayerName(pA1) || "A1",
              A2: getPlayerName(pA2) || "",
              B1: getPlayerName(pB1) || "B1",
              B2: getPlayerName(pB2) || "",
            })
            setPlayerIds({
              A1: getPlayerId(pA1),
              A2: getPlayerId(pA2),
              B1: getPlayerId(pB1),
              B2: getPlayerId(pB2),
            })
          }
        } else {
          if (!tournamentId) return
          const assignmentsRes = await listMyAssignmentsAction(tournamentId)
          if (assignmentsRes.success && assignmentsRes.data) {
            const rawData = assignmentsRes.data
            const assignments = Array.isArray(rawData)
              ? (rawData as Record<string, unknown>[])
              : ((rawData as unknown as Record<string, unknown>)
                  .assignments as Record<string, unknown>[]) || []

            const matchObj = assignments.find(
              (m) =>
                String(m.id) === String(matchId) ||
                (m.externalMatchId &&
                  String(m.externalMatchId) === String(matchId))
            )
            if (matchObj) {
              const teamsRes = await getTeamEventsAction(
                matchObj.eventId as string,
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
                      A1: team1Obj.player1.id
                        ? String(team1Obj.player1.id)
                        : "",
                      A2: team1Obj.player2?.id
                        ? String(team1Obj.player2.id)
                        : "",
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
                      B1: team2Obj.player1.id
                        ? String(team2Obj.player1.id)
                        : "",
                      B2: team2Obj.player2?.id
                        ? String(team2Obj.player2.id)
                        : "",
                    })
                  }
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
    isViewOnly,
    isMatchServiceMatch,
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
      let success = false
      let errorMsg = ""

      if (isMatchServiceMatch) {
        const winner =
          teamAScore > teamBScore
            ? "TEAM_A"
            : teamBScore > teamAScore
              ? "TEAM_B"
              : "DRAW"
        const finalSets = [...sets, [teamAScore, teamBScore]]
        const res = await confirmMatchResultAction(matchId, {
          winner,
          scoreA: teamAScore,
          scoreB: teamBScore,
          sets: finalSets,
        })
        success = !!res.success
        errorMsg = res.error || ""
      } else {
        const res = await updateFixtureResultAction(tournamentId, matchId, {
          score: `${teamAScore} - ${teamBScore}`,
          status: "completed",
        })
        success = !!res.success
        errorMsg = res.error || ""
      }

      if (success) {
        toast.success(
          t("tracker.successMessage", {
            defaultValue: "Cập nhật tỷ số trận đấu thành công!",
          })
        )
        router.push(`/tournaments/${tournamentId}`)
      } else {
        toast.error(
          errorMsg ||
            t("tracker.errorMessage", {
              defaultValue: "Không thể cập nhật tỷ số",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("tracker.unexpectedErrorMessage", {
          defaultValue: "Đã xảy ra lỗi không mong muốn",
        })
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate if the current set is completed (e.g. reaches target score, wins by 2)
  const setsWon = useMemo(() => {
    let wonA = 0
    let wonB = 0
    for (const s of sets) {
      if (s[0] > s[1]) wonA++
      else if (s[1] > s[0]) wonB++
    }
    const maxScore = Math.max(teamAScore, teamBScore)
    const minScore = Math.min(teamAScore, teamBScore)
    const isCurrentSetFinished =
      maxScore >= gameTarget && maxScore - minScore >= 2
    if (isCurrentSetFinished) {
      if (teamAScore > teamBScore) wonA++
      else wonB++
    }
    return { wonA, wonB }
  }, [sets, teamAScore, teamBScore, gameTarget])

  const isSetOver = useMemo(() => {
    const maxScore = Math.max(teamAScore, teamBScore)
    const minScore = Math.min(teamAScore, teamBScore)
    return maxScore >= gameTarget && maxScore - minScore >= 2
  }, [teamAScore, teamBScore, gameTarget])

  const isMatchOver = useMemo(() => {
    return setsWon.wonA >= setsToWin || setsWon.wonB >= setsToWin
  }, [setsWon, setsToWin])

  const winnerName = useMemo(() => {
    if (!isMatchOver) return ""
    return setsWon.wonA >= setsToWin ? teamAName : teamBName
  }, [isMatchOver, setsWon, setsToWin, teamAName, teamBName])

  const isNotStarted =
    matchStatus.toUpperCase() === "READY" ||
    matchStatus.toUpperCase() === "SCHEDULED"

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-background p-4 font-sans text-foreground">
      <div className="flex items-center justify-end gap-4">
        <BackButton />
      </div>
      <ScoreBoard />
      <PickleballCourt />

      {isViewOnly ? (
        isNotStarted ? (
          <SpectatorWaiting />
        ) : (
          isMatchOver && (
            <div className="animate-fade-in flex flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-6 text-center shadow-sm dark:bg-emerald-950/20">
              <h3 className="text-xl font-black tracking-widest text-emerald-800 uppercase dark:text-emerald-300">
                {t("tracker.gameOverTitle", {
                  defaultValue: "Match is over",
                })}
              </h3>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {t("tracker.winnerIs", {
                  defaultValue: `Winner: ${winnerName}`,
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
        <div className="flex flex-col gap-4">
          <CourtControls />
          {showTossWizard ? (
            <StartMatchControls matchId={matchId} />
          ) : (
            <Button
              type="button"
              onClick={() => setShowTossWizard(true)}
              className="h-14 w-full rounded-xl bg-emerald-600 text-lg font-black tracking-widest text-white shadow-lg transition-transform hover:bg-emerald-700 active:scale-[0.99]"
            >
              {t("tracker.actions.startMatch", { defaultValue: "Bắt đầu" })}
            </Button>
          )}
        </div>
      ) : isSetOver ? (
        isMatchOver ? (
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
          <div className="animate-fade-in flex flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-amber-500 bg-amber-50/50 p-6 text-center shadow-sm dark:bg-amber-950/20">
            <h3 className="text-xl font-black tracking-widest text-amber-800 uppercase dark:text-amber-300">
              {t("tracker.setCompletedTitle", {
                defaultValue: `Set ${currentSetId} kết thúc`,
                set: currentSetId,
              })}
            </h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {t("tracker.winnerIs", {
                defaultValue: `Chiến thắng: ${teamAScore > teamBScore ? teamAName : teamBName}`,
                name: teamAScore > teamBScore ? teamAName : teamBName,
              })}
            </p>
            <div className="font-mono text-4xl font-extrabold text-neutral-800 dark:text-neutral-100">
              {teamAScore} - {teamBScore}
            </div>
            <div className="mt-4 flex w-full gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 font-bold"
                onClick={() => handleUndo(isMatchServiceMatch, matchId)}
              >
                {t("tracker.undo", { defaultValue: "Hoàn tác (Undo)" })}
              </Button>
              <Button
                type="button"
                className="h-12 flex-1 animate-pulse rounded-xl bg-amber-600 font-extrabold text-white hover:bg-amber-700"
                onClick={startNextSet}
              >
                {t("tracker.startNextSetBtn", {
                  defaultValue: `Bắt đầu Set ${currentSetId + 1}`,
                  nextSet: currentSetId + 1,
                })}
              </Button>
            </div>
          </div>
        )
      ) : (
        /* Render normal match flow controls */
        <>
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
  const { t } = useScoreTranslation()
  return (
    <div className="p-8 text-center text-gray-500">
      {t("tracker.loading", { defaultValue: "Loading scoreboard..." })}
    </div>
  )
}

export default PickleballTracker
