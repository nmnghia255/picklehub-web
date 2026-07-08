"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"

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
  }
  status?: string
}

export function useMatchSync(
  matchId: string | null,
  isMatchServiceMatch: boolean
) {
  const [accessToken, setAccessToken] = useState<string | null>(null)

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
  } = useScoreStore()

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

  // Setup Socket connection and live sync
  useEffect(() => {
    if (!isMatchServiceMatch || !accessToken || !matchId) return

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

    const applyMatchScoreDetails = (
      scoreData: NonNullable<MatchEventData["score"]>,
      statusStr?: string
    ) => {
      if (!scoreData) return

      // Basic Scores
      setTeamAScore(scoreData.scoreA ?? 0)
      setTeamBScore(scoreData.scoreB ?? 0)
      setSets(scoreData.sets || [])
      setCurrentSetId(
        scoreData.currentSetId || (scoreData.sets?.length || 0) + 1
      )

      if (statusStr) {
        setMatchStatus(statusStr)
      }

      // Server & Serving Team
      if (scoreData.server === "TEAM_A" || scoreData.servingTeam === "TEAM_A") {
        setServingTeam("A")
      } else if (
        scoreData.server === "TEAM_B" ||
        scoreData.servingTeam === "TEAM_B"
      ) {
        setServingTeam("B")
      }

      // Server Number
      if (scoreData.serverNumber) {
        setServerNumber(scoreData.serverNumber as 1 | 2)
      }

      // Score Call prompter
      if (scoreData.scoreCall !== undefined) {
        setScoreCall(scoreData.scoreCall)
      }

      // Active serving player mapping
      if (scoreData.servingPlayerId) {
        const currentIds = useScoreStore.getState().playerIds
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
          const currentIds = useScoreStore.getState().playerIds
          if (pos.teamA.right?.id) {
            setIsA1Right(pos.teamA.right.id === currentIds.A1)
          }
          if (pos.teamB.right?.id) {
            setIsB1Right(pos.teamB.right.id === currentIds.B1)
          }
        } else {
          // Singles mode: based on score parity
          setIsA1Right((scoreData.scoreA ?? 0) % 2 === 0)
          setIsB1Right((scoreData.scoreB ?? 0) % 2 === 0)
        }
      } else {
        // Fallback if positions not sent: parse Singles/Doubles from players
        const currentIds = useScoreStore.getState().playerIds
        const isDoublesMode = !!(currentIds.A2 || currentIds.B2)
        if (!isDoublesMode) {
          setIsA1Right((scoreData.scoreA ?? 0) % 2 === 0)
          setIsB1Right((scoreData.scoreB ?? 0) % 2 === 0)
        }
      }
    }

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
            applyMatchScoreDetails(data.score || data, data.status)
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
    setServerNumber,
    setSocket,
    setScoreCall,
    setIsA1Right,
    setIsB1Right,
    setActiveServer,
  ])

  return { accessToken }
}
