"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { toast } from "sonner"

import { CourtControls } from "@/features/score/components/CourtControls"
import { PickleballCourt } from "@/features/score/components/PickleballCourt"
import { ScoreBoard } from "@/features/score/components/ScoreBoard"
import { ScoreControls } from "@/features/score/components/ScoreControls"
import { ScoreFooter } from "@/features/score/components/ScoreFooter"
import { SyncOverlay } from "@/features/score/components/SyncOverlay"
import { useScoreStore } from "@/features/score/stores/use-score-store"
import { listMyAssignmentsAction } from "@/features/tournaments/actions/referee-actions"
import { updateFixtureResultAction } from "@/features/tournaments/actions/schedule-actions"
import { getTeamEventsAction } from "@/features/tournaments/actions/team-actions"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

interface MatchEventData {
  matchId: string
  score?: {
    scoreA: number
    scoreB: number
    sets?: number[][]
    currentSetId?: number
    server?: string | null
  }
  status?: string
}

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
    initialize,
    setTeamNames,
    setPlayerNames,
    setTeamAScore,
    setTeamBScore,
    setServingTeam,
    setSets,
    setCurrentSetId,
    setMatchStatus,
    setIsConnected,
    setIsSyncing,
    setIsSaving,
    setSocket,
  } = useScoreStore()

  const [accessToken, setAccessToken] = useState<string | null>(null)

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

  // Load session token
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session")
        if (res.ok) {
          const session = await res.json()
          if (session?.accessToken) {
            setAccessToken(session.accessToken)
          }
        }
      } catch (err) {
        console.error("Failed to load session accessToken:", err)
      }
    }
    fetchSession()
  }, [])

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
    teamAName,
    teamBName,
  ])

  // Setup Socket connection and live sync
  useEffect(() => {
    if (!isMatchServiceMatch || !accessToken) return

    const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""
    const socketUrl = gatewayUrl.endsWith("/")
      ? gatewayUrl.slice(0, -1)
      : gatewayUrl

    const newSocket = io(`${socketUrl}/matches`, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket"],
      reconnection: true,
    })

    const timerId = setTimeout(() => {
      setSocket(newSocket)
    }, 0)

    const syncMatchDetails = async () => {
      try {
        setIsSyncing(true)
        const res = await fetch(`${socketUrl}/api/matches/${matchId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        if (res.ok) {
          const matchData = await res.json()
          const data = matchData.data || matchData
          if (data) {
            setTeamAScore(data.scoreA || 0)
            setTeamBScore(data.scoreB || 0)
            setSets(data.sets || [])
            setCurrentSetId((data.sets?.length || 0) + 1)
            setMatchStatus(data.status || "LIVE")
          }
        }
      } catch (err) {
        console.error("Failed to sync match details:", err)
      } finally {
        setIsSyncing(false)
      }
    }

    newSocket.on("connect", () => {
      setIsConnected(true)
      newSocket.emit("join-match", { matchId })
      syncMatchDetails()
    })

    newSocket.on("disconnect", () => {
      setIsConnected(false)
    })

    newSocket.on("match-event", (data: MatchEventData) => {
      if (data && data.matchId === matchId && data.score) {
        setTeamAScore(data.score.scoreA)
        setTeamBScore(data.score.scoreB)
        setSets(data.score.sets || [])
        setCurrentSetId(data.score.currentSetId || 1)
        if (data.score.server === "TEAM_A") {
          setServingTeam("A")
        } else if (data.score.server === "TEAM_B") {
          setServingTeam("B")
        }
        if (data.status) {
          setMatchStatus(data.status)
        }
      }
    })

    return () => {
      clearTimeout(timerId)
      newSocket.emit("leave-match", { matchId })
      newSocket.close()
      setSocket(null)
    }
  }, [
    isMatchServiceMatch,
    accessToken,
    matchId,
    setTeamAScore,
    setTeamBScore,
    setSets,
    setCurrentSetId,
    setMatchStatus,
    setIsConnected,
    setIsSyncing,
    setServingTeam,
    setSocket,
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

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-background p-4 font-sans text-foreground">
      <ScoreBoard />
      <PickleballCourt />
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
      <SyncOverlay isMatchServiceMatch={isMatchServiceMatch} />
    </div>
  )
}

export default PickleballTracker
