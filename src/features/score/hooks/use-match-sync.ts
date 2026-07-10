"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"

import { getMatchDetailsAction } from "@/features/matches/actions"

import { useScoreStore } from "../stores/use-score-store"

interface PlayerPosition {
  id: string
  name: string
  avatarUrl?: string | null
}

interface TeamPositions {
  right: PlayerPosition | null
  left: PlayerPosition | null
}

interface MatchEventData {
  event: string
  matchId: string
  score?: {
    scoreA: number
    scoreB: number
    sets?: number[][]
    currentSetId?: number
    server?: string | null
    servingTeam?: "TEAM_A" | "TEAM_B" | null
    servingPlayerId?: string | null
    serverNumber?: number
    scoreCall?: string | null
    positions?: {
      teamA: TeamPositions
      teamB: TeamPositions
    } | null
    gameTarget?: number | null
    setsToWin?: number | null
    bestOfSets?: number | null
    pointsToWin?: number | null
  }
  status?: string
}

function getExpectedSwappedSides(
  currentSetId: number,
  scoreA: number,
  scoreB: number,
  gameTarget: number
): boolean {
  // Base swap state based on set number: even sets are swapped
  let swapped = currentSetId % 2 === 0

  // Mid-set end-change: swap at the halfway point of every set
  const swapThreshold = gameTarget === 15 ? 8 : gameTarget === 21 ? 11 : 6
  const maxScore = Math.max(scoreA, scoreB)
  if (maxScore >= swapThreshold) {
    swapped = !swapped
  }

  return swapped
}

export function useMatchSync(
  matchId: string | null,
  isMatchServiceMatch: boolean,
  isViewOnly = false
) {
  // Use a ref for accessToken so the socket effect is not re-triggered when the
  // token loads. The socket is set up only once (after the initial session fetch).
  const accessTokenRef = useRef<string | null>(null)
  const [tokenReady, setTokenReady] = useState(isViewOnly)
  const lastScoreDataRef = useRef<NonNullable<MatchEventData["score"]> | null>(
    null
  )
  const playerIds = useScoreStore((state) => state.playerIds)

  const {
    setTeamAScore,
    setTeamBScore,
    setServingTeam,
    setServerNumber,
    setSets,
    setCurrentSetId,
    setMatchStatus,
    setIsConnected,
    setIsSyncing,
    setSocket,
    setScoreCall,
    setIsA1Right,
    setIsB1Right,
    setActiveServer,
    setSetsToWin,
    setGameTarget,
    setIsSwappedSides,
  } = useScoreStore()

  const mapPositionsAndServer = useCallback(
    (
      scoreData: NonNullable<MatchEventData["score"]>,
      currentIds: Record<string, string>
    ) => {
      // Active serving player mapping
      if (scoreData.servingPlayerId) {
        if (scoreData.servingPlayerId === currentIds.A1) {
          setActiveServer("A1")
        } else if (scoreData.servingPlayerId === currentIds.A2) {
          setActiveServer("A2")
        } else if (scoreData.servingPlayerId === currentIds.B1) {
          setActiveServer("B1")
        } else if (scoreData.servingPlayerId === currentIds.B2) {
          setActiveServer("B2")
        }
      }

      // Positions mapping (Right/Left court slots)
      if (scoreData.positions) {
        const pos = scoreData.positions
        const hasLeftPlayers = !!(pos.teamA.left || pos.teamB.left)
        if (hasLeftPlayers) {
          // Doubles mode
          if (pos.teamA.right?.id) {
            setIsA1Right(pos.teamA.right.id === currentIds.A1)
          }
          if (pos.teamB.right?.id) {
            setIsB1Right(pos.teamB.right.id === currentIds.B1)
          }
        } else {
          // Singles mode: based on serving team's score parity for diagonal receiver positioning alignment
          const isTeamAServing =
            scoreData.server === "TEAM_A" || scoreData.servingTeam === "TEAM_A"
          const servingScore = isTeamAServing
            ? (scoreData.scoreA ?? 0)
            : (scoreData.scoreB ?? 0)
          const isRight = servingScore % 2 === 0
          setIsA1Right(isRight)
          setIsB1Right(isRight)
        }
      } else {
        // Fallback if positions not sent: parse Singles/Doubles from players
        const isDoublesMode = !!(currentIds.A2 || currentIds.B2)
        if (!isDoublesMode) {
          const isTeamAServing =
            scoreData.server === "TEAM_A" || scoreData.servingTeam === "TEAM_A"
          const servingScore = isTeamAServing
            ? (scoreData.scoreA ?? 0)
            : (scoreData.scoreB ?? 0)
          const isRight = servingScore % 2 === 0
          setIsA1Right(isRight)
          setIsB1Right(isRight)
        }
      }
    },
    [setActiveServer, setIsA1Right, setIsB1Right]
  )

  // Re-apply positions and server mappings when playerIds are async-loaded to prevent race conditions
  useEffect(() => {
    const scoreData = lastScoreDataRef.current
    if (scoreData) {
      mapPositionsAndServer(scoreData, playerIds)
    }
  }, [playerIds, mapPositionsAndServer])

  // Load session token — mark ready after fetch completes (even if no token)
  // so the socket effect only runs once with the final token value.
  useEffect(() => {
    if (isViewOnly) return

    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session")
        if (res.ok) {
          const session = await res.json()
          if (session?.accessToken) {
            accessTokenRef.current = session.accessToken
          }
        }
      } catch (err) {
        console.error("Failed to load session accessToken:", err)
      } finally {
        setTokenReady(true)
      }
    }
    fetchSession()
  }, [isViewOnly])

  // Setup Socket connection and live sync.
  // Wait until the session fetch is done before connecting so we only connect
  // once with the correct (or empty) token — avoiding a double-connect race.
  useEffect(() => {
    if (!isMatchServiceMatch || !matchId || !tokenReady) return

    const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""
    const socketUrl = gatewayUrl.endsWith("/")
      ? gatewayUrl.slice(0, -1)
      : gatewayUrl

    const token = accessTokenRef.current
      ? `Bearer ${accessTokenRef.current}`
      : ""

    const socketOptions = {
      transports: ["websocket"],
      reconnection: true,
      auth: token ? { token } : undefined,
    }

    const newSocket = io(`${socketUrl}/matches`, socketOptions)

    const timerId = setTimeout(() => {
      setSocket(newSocket)
    }, 0)

    // Track whether we've received at least one authoritative match-event from the
    // socket. Once we have, we must NOT let the REST hydration sync overwrite it
    // with potentially stale data.
    let hasReceivedLiveEvent = false

    const applyMatchScoreDetails = (
      scoreData: NonNullable<MatchEventData["score"]>,
      statusStr?: string
    ) => {
      if (!scoreData) return

      // Support fallback to data.livescore if properties are nested (for REST Match response)
      const rawScore = scoreData as Record<string, unknown>
      const livescore = (rawScore.livescore || scoreData) as NonNullable<
        MatchEventData["score"]
      >

      let scoreA = scoreData.scoreA
      let scoreB = scoreData.scoreB

      const resolvedCurrentSetId =
        livescore.currentSetId ?? scoreData.sets?.length ?? 1 // last element IS the current set

      if (scoreData.sets && scoreData.sets.length > 0) {
        const currentSet =
          scoreData.sets[resolvedCurrentSetId - 1] ||
          scoreData.sets[scoreData.sets.length - 1]
        if (currentSet) {
          scoreA = currentSet[0]
          scoreB = currentSet[1]
        }
      }

      const resolvedScore = {
        ...livescore,
        scoreA,
        scoreB,
        sets: scoreData.sets,
        currentSetId: resolvedCurrentSetId,
      }

      lastScoreDataRef.current = resolvedScore

      // Extract settings if provided inside the score object or at root level of event
      // Prefer new fields (bestOfSets / pointsToWin) over legacy (setsToWin / gameTarget)
      if (
        resolvedScore.bestOfSets !== undefined &&
        resolvedScore.bestOfSets !== null
      ) {
        setSetsToWin(Math.ceil(resolvedScore.bestOfSets / 2))
      } else if (
        resolvedScore.setsToWin !== undefined &&
        resolvedScore.setsToWin !== null
      ) {
        setSetsToWin(Number(resolvedScore.setsToWin))
      }
      if (
        resolvedScore.pointsToWin !== undefined &&
        resolvedScore.pointsToWin !== null
      ) {
        setGameTarget(Number(resolvedScore.pointsToWin))
      } else if (
        resolvedScore.gameTarget !== undefined &&
        resolvedScore.gameTarget !== null
      ) {
        setGameTarget(Number(resolvedScore.gameTarget))
      }

      // Basic Scores
      setTeamAScore(resolvedScore.scoreA ?? 0)
      setTeamBScore(resolvedScore.scoreB ?? 0)

      // The backend sends `sets` as ALL set scores including the current in-progress
      // set (e.g. [[11,9],[1,0]] = Set 1 done, Set 2 at 1-0).
      // The FE `sets` state is used for COMPLETED sets only (for setsWon display).
      // We slice off the current set so setsWon is not miscounted, which would
      // prematurely trigger isMatchOver and hide the score controls.
      const completedSets = resolvedScore.sets
        ? resolvedScore.sets.slice(0, resolvedScore.currentSetId - 1)
        : []

      setSets(completedSets)
      setCurrentSetId(resolvedScore.currentSetId)

      if (statusStr) {
        setMatchStatus(statusStr)
      }

      // Calculate expected swapped sides for the viewer/spectator
      const expectedSwapped = getExpectedSwappedSides(
        resolvedScore.currentSetId,
        resolvedScore.scoreA ?? 0,
        resolvedScore.scoreB ?? 0,
        resolvedScore.gameTarget ?? 11
      )
      setIsSwappedSides(expectedSwapped)

      // Server & Serving Team
      if (
        resolvedScore.server === "TEAM_A" ||
        resolvedScore.servingTeam === "TEAM_A"
      ) {
        setServingTeam("A")
      } else if (
        resolvedScore.server === "TEAM_B" ||
        resolvedScore.servingTeam === "TEAM_B"
      ) {
        setServingTeam("B")
      }

      // Server Number
      if (resolvedScore.serverNumber) {
        setServerNumber(resolvedScore.serverNumber as 1 | 2)
      }

      // Score Call prompter
      if (resolvedScore.scoreCall !== undefined) {
        setScoreCall(resolvedScore.scoreCall)
      }

      // Apply positions and server mapping
      mapPositionsAndServer(resolvedScore, useScoreStore.getState().playerIds)
    }

    const syncMatchDetails = async () => {
      try {
        setIsSyncing(true)
        const matchRes = await getMatchDetailsAction(matchId)
        if (matchRes.success && matchRes.data) {
          interface MatchDetailsData {
            gameTarget?: number | null
            setsToWin?: number | null
            bestOfSets?: number | null
            pointsToWin?: number | null
            status?: string
            score?: MatchEventData["score"]
          }
          const data = matchRes.data as unknown as MatchDetailsData
          if (data) {
            // Derive setsToWin from bestOfSets (new field) or fall back to setsToWin (legacy)
            if (data.bestOfSets !== undefined && data.bestOfSets !== null) {
              setSetsToWin(Math.ceil(data.bestOfSets / 2))
            } else if (
              data.setsToWin !== undefined &&
              data.setsToWin !== null
            ) {
              setSetsToWin(Number(data.setsToWin))
            }
            // Derive gameTarget from pointsToWin (new field) or fall back to gameTarget (legacy)
            if (data.pointsToWin !== undefined && data.pointsToWin !== null) {
              setGameTarget(Number(data.pointsToWin))
            } else if (
              data.gameTarget !== undefined &&
              data.gameTarget !== null
            ) {
              setGameTarget(Number(data.gameTarget))
            }

            // If we've already received a live socket event with authoritative
            // score data, skip applying the REST score to avoid overwriting it
            // with stale data and resetting the scoreboard to 0-0.
            if (hasReceivedLiveEvent) {
              // Only apply match status from REST (score is already up-to-date)
              if (data.status) {
                setMatchStatus(data.status)
              }
            } else {
              applyMatchScoreDetails(
                (data.score || data) as NonNullable<MatchEventData["score"]>,
                data.status
              )
            }
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

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
    })

    newSocket.on("disconnect", () => {
      setIsConnected(false)
    })

    newSocket.on("match-event", (data: MatchEventData) => {
      if (
        data &&
        data.matchId &&
        matchId &&
        data.matchId.toLowerCase() === matchId.toLowerCase() &&
        data.score
      ) {
        // Mark that we have authoritative live data from the socket.
        // This prevents any subsequent REST re-sync from overwriting this score.
        hasReceivedLiveEvent = true
        applyMatchScoreDetails(data.score, data.status)
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
    tokenReady, // only re-run when session fetch completes, NOT when token value changes
    matchId,
    setTeamAScore,
    setTeamBScore,
    setSets,
    setCurrentSetId,
    setMatchStatus,
    setIsConnected,
    setIsSyncing,
    setServingTeam,
    setServerNumber,
    setSocket,
    setScoreCall,
    setIsA1Right,
    setIsB1Right,
    setActiveServer,
    mapPositionsAndServer,
    setSetsToWin,
    setGameTarget,
    isViewOnly,
    setIsSwappedSides,
  ])

  return { accessTokenRef }
}
