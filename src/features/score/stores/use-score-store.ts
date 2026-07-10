import type { Socket } from "socket.io-client"
import { toast } from "sonner"
import { create } from "zustand"

import { resetMatchScoreAction } from "@/features/matches/actions"

export type Team = "A" | "B"
export type ServerId = "A1" | "A2" | "B1" | "B2"
export type ServerOrdinal = 1 | 2

export interface GameSnapshot {
  teamAScore: number
  teamBScore: number
  servingTeam: Team
  serverNumber: ServerOrdinal
  isA1Right: boolean
  isB1Right: boolean
  activeServer: ServerId
  isSwappedSides: boolean
  isAutoSwapped: boolean
  sets: number[][]
  currentSetId: number
}

interface ScoreState {
  teamAName: string
  teamBName: string
  playerNames: Record<ServerId, string>
  playerIds: Record<ServerId, string>
  teamAScore: number
  teamBScore: number
  servingTeam: Team
  serverNumber: ServerOrdinal
  isA1Right: boolean
  isB1Right: boolean
  activeServer: ServerId
  history: GameSnapshot[]
  isSaving: boolean
  isSwappedSides: boolean
  isConnected: boolean
  isSyncing: boolean
  sets: number[][]
  currentSetId: number
  matchStatus: string
  socket: Socket | null

  // Refactored Rules & States
  isDoubles: boolean
  gameTarget: number
  isAutoSwapped: boolean
  isTimeoutActive: boolean
  timeoutTeam: Team | "TECHNICAL" | null
  timeoutSecondsLeft: number
  scoreCall: string | null
  setsToWin: number
}

interface ScoreActions {
  initialize: (params: {
    team1?: string | null
    team2?: string | null
    isMatchServiceMatch: boolean
    isViewOnly?: boolean
  }) => void
  setTeamNames: (teamA: string, teamB: string) => void
  setPlayerNames: (
    names:
      | Partial<Record<ServerId, string>>
      | ((prev: Record<ServerId, string>) => Record<ServerId, string>)
  ) => void
  setPlayerIds: (ids: Record<ServerId, string>) => void
  setTeamAScore: (score: number | ((s: number) => number)) => void
  setTeamBScore: (score: number | ((s: number) => number)) => void
  setServingTeam: (team: Team) => void
  setServerNumber: (num: ServerOrdinal) => void
  setIsA1Right: (right: boolean | ((r: boolean) => boolean)) => void
  setIsB1Right: (right: boolean | ((r: boolean) => boolean)) => void
  setActiveServer: (server: ServerId | ((s: ServerId) => ServerId)) => void
  setSets: (sets: number[][]) => void
  setCurrentSetId: (id: number) => void
  setMatchStatus: (status: string) => void
  setIsConnected: (connected: boolean) => void
  setIsSyncing: (syncing: boolean) => void
  setIsSaving: (saving: boolean) => void
  setIsSwappedSides: (swapped: boolean | ((s: boolean) => boolean)) => void
  setSocket: (socket: Socket | null) => void
  saveHistory: () => void
  handleRallyWin: (
    winningTeam: Team,
    isMatchServiceMatch: boolean,
    matchId: string | null
  ) => void
  handleUndo: (isMatchServiceMatch: boolean, matchId: string | null) => void
  applyReset: (isMatchServiceMatch: boolean, matchId: string | null) => void
  setScoreCall: (call: string | null) => void
  startNextSet: () => void

  // New Actions
  setGameTarget: (target: number) => void
  setSetsToWin: (num: number) => void
  startTimeout: (team: Team | "TECHNICAL") => void
  stopTimeout: () => void
  decrementTimeoutTimer: () => void
}

const getPlayers = (teamStr: string | null, defaultPrefix: string) => {
  if (!teamStr) return [defaultPrefix + "1", defaultPrefix + "2"]
  const parts = teamStr.split(/\s*[\/\-]\s*/)
  if (parts.length === 1) {
    return [parts[0].trim(), ""]
  }
  return [
    parts[0]?.trim() || defaultPrefix + "1",
    parts[1]?.trim() || defaultPrefix + "2",
  ]
}

export const useScoreStore = create<ScoreState & ScoreActions>((set, get) => ({
  // Initial state
  teamAName: "Đội A",
  teamBName: "Đội B",
  playerNames: {
    A1: "A1",
    A2: "A2",
    B1: "B1",
    B2: "B2",
  },
  playerIds: {
    A1: "",
    A2: "",
    B1: "",
    B2: "",
  },
  teamAScore: 0,
  teamBScore: 0,
  servingTeam: "A",
  serverNumber: 2,
  isA1Right: true,
  isB1Right: true,
  activeServer: "A1",
  history: [],
  isSaving: false,
  isSwappedSides: false,
  isConnected: true,
  isSyncing: false,
  sets: [],
  currentSetId: 1,
  matchStatus: "LIVE",
  socket: null,

  isDoubles: true,
  gameTarget: 11,
  setsToWin: 2,
  isAutoSwapped: false,
  isTimeoutActive: false,
  timeoutTeam: null,
  timeoutSecondsLeft: 0,
  scoreCall: null,

  // Actions
  initialize: ({ team1, team2, isMatchServiceMatch, isViewOnly }) => {
    const [initialA1, initialA2] = getPlayers(team1 || null, "A")
    const [initialB1, initialB2] = getPlayers(team2 || null, "B")

    const isDoubles = initialA2 !== "" || initialB2 !== ""

    set({
      teamAName: team1 || "Đội A",
      teamBName: team2 || "Đội B",
      playerNames: {
        A1: initialA1,
        A2: initialA2,
        B1: initialB1,
        B2: initialB2,
      },
      playerIds: {
        A1: "",
        A2: "",
        B1: "",
        B2: "",
      },
      isDoubles,
      teamAScore: 0,
      teamBScore: 0,
      servingTeam: "A",
      serverNumber: isDoubles ? 2 : 1, // Doubles starts at server 2, Singles starts at server 1
      isA1Right: true,
      isB1Right: true,
      activeServer: "A1",
      history: [],
      isSaving: false,
      isSwappedSides: false,
      isConnected: !isMatchServiceMatch,
      isSyncing: false,
      sets: [],
      currentSetId: 1,
      // For match-service matches, start as READY so the SpectatorWaiting screen
      // shows until the WebSocket sync provides the real status. For referee mode
      // (non-view-only) the match is assumed LIVE once they land on the page.
      matchStatus: isMatchServiceMatch && isViewOnly ? "READY" : "LIVE",
      socket: null,
      gameTarget: 11,
      setsToWin: 2,
      isAutoSwapped: false,
      isTimeoutActive: false,
      timeoutTeam: null,
      timeoutSecondsLeft: 0,
      scoreCall: null,
    })
  },

  setTeamNames: (teamA, teamB) => set({ teamAName: teamA, teamBName: teamB }),

  setPlayerNames: (names) =>
    set((state) => {
      const nextNames =
        typeof names === "function"
          ? names(state.playerNames)
          : { ...state.playerNames, ...names }
      const isDoubles = nextNames.A2 !== "" || nextNames.B2 !== ""
      return {
        playerNames: nextNames,
        isDoubles,
      }
    }),

  setPlayerIds: (ids) => set({ playerIds: ids }),

  setTeamAScore: (score) =>
    set((state) => ({
      teamAScore: typeof score === "function" ? score(state.teamAScore) : score,
    })),

  setTeamBScore: (score) =>
    set((state) => ({
      teamBScore: typeof score === "function" ? score(state.teamBScore) : score,
    })),

  setServingTeam: (team) => set({ servingTeam: team }),
  setServerNumber: (num) => set({ serverNumber: num }),

  setIsA1Right: (right) =>
    set((state) => ({
      isA1Right: typeof right === "function" ? right(state.isA1Right) : right,
    })),

  setIsB1Right: (right) =>
    set((state) => ({
      isB1Right: typeof right === "function" ? right(state.isB1Right) : right,
    })),

  setActiveServer: (server) =>
    set((state) => ({
      activeServer:
        typeof server === "function" ? server(state.activeServer) : server,
    })),

  setSets: (sets) => set({ sets }),
  setCurrentSetId: (id) => set({ currentSetId: id }),
  setMatchStatus: (status) => set({ matchStatus: status }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  setIsSaving: (saving) => set({ isSaving: saving }),

  setIsSwappedSides: (swapped) =>
    set((state) => ({
      isSwappedSides:
        typeof swapped === "function" ? swapped(state.isSwappedSides) : swapped,
    })),

  setSocket: (socket) => set({ socket }),

  setGameTarget: (target) => set({ gameTarget: target }),
  setSetsToWin: (num) => set({ setsToWin: num }),

  startTimeout: (team) => {
    set({
      isTimeoutActive: true,
      timeoutTeam: team,
      timeoutSecondsLeft: team === "TECHNICAL" ? 120 : 60, // 2 mins for tech, 1 min for normal
    })
  },

  stopTimeout: () => {
    set({
      isTimeoutActive: false,
      timeoutTeam: null,
      timeoutSecondsLeft: 0,
    })
  },

  decrementTimeoutTimer: () => {
    set((state) => {
      if (state.timeoutSecondsLeft <= 1) {
        return {
          isTimeoutActive: false,
          timeoutTeam: null,
          timeoutSecondsLeft: 0,
        }
      }
      return {
        timeoutSecondsLeft: state.timeoutSecondsLeft - 1,
      }
    })
  },

  saveHistory: () => {
    const {
      teamAScore,
      teamBScore,
      servingTeam,
      serverNumber,
      isA1Right,
      isB1Right,
      activeServer,
      isSwappedSides,
      isAutoSwapped,
      sets,
      currentSetId,
    } = get()
    set((state) => ({
      history: [
        ...state.history,
        {
          teamAScore,
          teamBScore,
          servingTeam,
          serverNumber,
          isA1Right,
          isB1Right,
          activeServer,
          isSwappedSides,
          isAutoSwapped,
          sets,
          currentSetId,
        },
      ],
    }))
  },

  handleRallyWin: (winningTeam, isMatchServiceMatch, matchId) => {
    const {
      currentSetId,
      servingTeam,
      serverNumber,
      saveHistory,
      socket,
      isDoubles,
      gameTarget,
      isSwappedSides,
      isAutoSwapped,
    } = get()

    if (isMatchServiceMatch && socket && matchId) {
      // Emit the score-point to the backend. The socket match-event response
      // will sync the authoritative state. We also apply the local optimistic
      // update below so the UI responds immediately without waiting for the
      // network round-trip. The hasReceivedLiveEvent guard in use-match-sync.ts
      // prevents the REST re-sync from overwriting live socket data.
      socket.emit("score-point", {
        matchId,
        setId: currentSetId,
        scoringTeam: winningTeam === "A" ? "TEAM_A" : "TEAM_B",
      })
    }

    saveHistory()

    let nextAScore = get().teamAScore
    let nextBScore = get().teamBScore

    if (isDoubles) {
      // DOUBLE SCORING LOGIC
      if (winningTeam === servingTeam) {
        if (servingTeam === "A") {
          nextAScore = nextAScore + 1
          set((state) => ({
            teamAScore: state.teamAScore + 1,
            isA1Right: !state.isA1Right,
          }))
        } else {
          nextBScore = nextBScore + 1
          set((state) => ({
            teamBScore: state.teamBScore + 1,
            isB1Right: !state.isB1Right,
          }))
        }
      } else {
        if (serverNumber === 1) {
          set({ serverNumber: 2 })
          if (servingTeam === "A") {
            set((state) => ({
              activeServer: state.activeServer === "A1" ? "A2" : "A1",
            }))
          } else {
            set((state) => ({
              activeServer: state.activeServer === "B1" ? "B2" : "B1",
            }))
          }
        } else {
          // Side Out
          const newServingTeam: Team = servingTeam === "A" ? "B" : "A"
          set({ servingTeam: newServingTeam, serverNumber: 1 })
          if (newServingTeam === "A") {
            set((state) => ({ activeServer: state.isA1Right ? "A1" : "A2" }))
          } else {
            set((state) => ({ activeServer: state.isB1Right ? "B1" : "B2" }))
          }
        }
      }
    } else {
      // SINGLES SCORING LOGIC
      if (winningTeam === servingTeam) {
        if (servingTeam === "A") {
          nextAScore = nextAScore + 1
          set(() => {
            const isRight = nextAScore % 2 === 0
            return {
              teamAScore: nextAScore,
              isA1Right: isRight,
              isB1Right: isRight, // Diagonal receiver positioning alignment
            }
          })
        } else {
          nextBScore = nextBScore + 1
          set(() => {
            const isRight = nextBScore % 2 === 0
            return {
              teamBScore: nextBScore,
              isB1Right: isRight,
              isA1Right: isRight, // Diagonal receiver positioning alignment
            }
          })
        }
      } else {
        // Side Out immediately
        const newServingTeam: Team = servingTeam === "A" ? "B" : "A"
        const nextServerScore = newServingTeam === "A" ? nextAScore : nextBScore
        const isRight = nextServerScore % 2 === 0
        set({
          servingTeam: newServingTeam,
          serverNumber: 1,
          activeServer: newServingTeam === "A" ? "A1" : "B1",
          isA1Right: isRight,
          isB1Right: isRight,
        })
      }
    }

    // Auto end-change check at the halfway point of every set
    const swapThreshold = gameTarget === 15 ? 8 : gameTarget === 21 ? 11 : 6
    const maxScore = Math.max(nextAScore, nextBScore)
    if (maxScore === swapThreshold && !isAutoSwapped) {
      set({ isSwappedSides: !isSwappedSides, isAutoSwapped: true })
    }
  },

  handleUndo: (isMatchServiceMatch, matchId) => {
    const { history, socket } = get()

    if (isMatchServiceMatch && socket && matchId) {
      // For socket-driven matches, the backend is the authoritative source.
      // Emit undo-point and let the match-event response update state correctly.
      // We do NOT pop local history here because history snapshots are taken
      // before the authoritative socket state is applied, so they can be stale
      // (e.g., 0-0 instead of the real previous state).
      socket.emit("undo-point", { matchId })
      return
    }

    if (history.length === 0) return
    const lastState = history.at(-1)
    if (!lastState) return

    set({
      teamAScore: lastState.teamAScore,
      teamBScore: lastState.teamBScore,
      servingTeam: lastState.servingTeam,
      serverNumber: lastState.serverNumber,
      isA1Right: lastState.isA1Right,
      isB1Right: lastState.isB1Right,
      activeServer: lastState.activeServer,
      isSwappedSides: lastState.isSwappedSides,
      isAutoSwapped: lastState.isAutoSwapped,
      sets: lastState.sets || [],
      currentSetId: lastState.currentSetId || 1,
    })
    set((state) => ({ history: state.history.slice(0, -1) }))
  },

  applyReset: async (isMatchServiceMatch, matchId) => {
    const { isDoubles } = get()
    set({
      teamAScore: 0,
      teamBScore: 0,
      servingTeam: "A",
      serverNumber: isDoubles ? 2 : 1,
      isA1Right: true,
      isB1Right: true,
      activeServer: "A1",
      history: [],
      isAutoSwapped: false,
      scoreCall: null,
      sets: [],
      currentSetId: 1,
    })

    if (isMatchServiceMatch && matchId) {
      try {
        const res = await resetMatchScoreAction(matchId)
        if (res && !res.success) {
          toast.error(res.error || "Không thể đặt lại tỷ số trên máy chủ")
        } else {
          toast.success("Đặt lại tỷ số trận đấu thành công trên máy chủ!")
        }
      } catch (err) {
        console.error("Failed to reset match score on server:", err)
        toast.error("Đã xảy ra lỗi khi đặt lại tỷ số trên máy chủ")
      }
    }
  },

  setScoreCall: (call) => set({ scoreCall: call }),

  startNextSet: () => {
    const { teamAScore, teamBScore, sets, currentSetId, isDoubles, socket } =
      get()

    const nextSetId = currentSetId + 1
    const nextServingTeam: Team = nextSetId % 2 === 0 ? "B" : "A"

    if (socket) {
      // Socket-driven match: DON'T push to sets here — the match-event from the
      // backend already gave us the correct `completedSets` via applyMatchScoreDetails.
      // Pushing again would duplicate the just-finished set in the array.
      // The next match-event (first point of the new set) will provide the
      // authoritative sets state if anything needs correcting.
      set({
        currentSetId: nextSetId,
        teamAScore: 0,
        teamBScore: 0,
        servingTeam: nextServingTeam,
        serverNumber: isDoubles ? 2 : 1,
        isA1Right: true,
        isB1Right: true,
        activeServer: nextServingTeam === "A" ? "A1" : "B1",
        isAutoSwapped: false,
        scoreCall: null,
        isSwappedSides: nextSetId % 2 === 0,
      })
    } else {
      // Local-only match: push the completed set scores ourselves.
      const updatedSets = [...sets, [teamAScore, teamBScore]]
      set({
        sets: updatedSets,
        currentSetId: nextSetId,
        teamAScore: 0,
        teamBScore: 0,
        servingTeam: nextServingTeam,
        serverNumber: isDoubles ? 2 : 1,
        isA1Right: true,
        isB1Right: true,
        activeServer: nextServingTeam === "A" ? "A1" : "B1",
        isAutoSwapped: false,
        isSwappedSides: nextSetId % 2 === 0,
      })
    }
  },
}))
