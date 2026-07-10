import type { Socket } from "socket.io-client"
import { create } from "zustand"

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
}

interface ScoreState {
  teamAName: string
  teamBName: string
  playerNames: Record<ServerId, string>
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
}

interface ScoreActions {
  initialize: (params: {
    team1?: string | null
    team2?: string | null
    defaultTeam1Label: string
    defaultTeam2Label: string
    isMatchServiceMatch: boolean
  }) => void
  setTeamNames: (teamA: string, teamB: string) => void
  setPlayerNames: (
    names:
      | Partial<Record<ServerId, string>>
      | ((prev: Record<ServerId, string>) => Record<ServerId, string>)
  ) => void
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
  applyReset: () => void
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
  teamAName: "",
  teamBName: "",
  playerNames: {
    A1: "A1",
    A2: "A2",
    B1: "B1",
    B2: "B2",
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

  // Actions
  initialize: ({
    team1,
    team2,
    defaultTeam1Label,
    defaultTeam2Label,
    isMatchServiceMatch,
  }) => {
    const [initialA1, initialA2] = getPlayers(team1 || null, "A")
    const [initialB1, initialB2] = getPlayers(team2 || null, "B")

    set({
      teamAName: team1 || defaultTeam1Label,
      teamBName: team2 || defaultTeam2Label,
      playerNames: {
        A1: initialA1,
        A2: initialA2,
        B1: initialB1,
        B2: initialB2,
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
      isConnected: !isMatchServiceMatch,
      isSyncing: false,
      sets: [],
      currentSetId: 1,
      matchStatus: "LIVE",
      socket: null,
    })
  },

  setTeamNames: (teamA, teamB) => set({ teamAName: teamA, teamBName: teamB }),

  setPlayerNames: (names) =>
    set((state) => ({
      playerNames:
        typeof names === "function"
          ? names(state.playerNames)
          : { ...state.playerNames, ...names },
    })),

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

  saveHistory: () => {
    const {
      teamAScore,
      teamBScore,
      servingTeam,
      serverNumber,
      isA1Right,
      isB1Right,
      activeServer,
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
        },
      ],
    }))
  },

  handleRallyWin: (winningTeam, isMatchServiceMatch, matchId) => {
    const {
      currentSetId,
      servingTeam,
      serverNumber,
      isA1Right,
      isB1Right,
      saveHistory,
      socket,
    } = get()

    if (isMatchServiceMatch && socket && matchId) {
      socket.emit("score-point", {
        matchId,
        setId: currentSetId,
        scoringTeam: winningTeam === "A" ? "TEAM_A" : "TEAM_B",
      })
    }

    saveHistory()

    if (winningTeam === servingTeam) {
      if (servingTeam === "A") {
        set((state) => ({
          teamAScore: state.teamAScore + 1,
          isA1Right: !state.isA1Right,
        }))
      } else {
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
        const newServingTeam: Team = servingTeam === "A" ? "B" : "A"
        set({ servingTeam: newServingTeam, serverNumber: 1 })
        if (newServingTeam === "A") {
          set({ activeServer: isA1Right ? "A1" : "A2" })
        } else {
          set({ activeServer: isB1Right ? "B1" : "B2" })
        }
      }
    }
  },

  handleUndo: (isMatchServiceMatch, matchId) => {
    const { history, socket } = get()

    if (isMatchServiceMatch && socket && matchId) {
      socket.emit("undo-point", { matchId })
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
    })
    set((state) => ({ history: state.history.slice(0, -1) }))
  },

  applyReset: () => {
    set({
      teamAScore: 0,
      teamBScore: 0,
      servingTeam: "A",
      serverNumber: 2,
      isA1Right: true,
      isB1Right: true,
      activeServer: "A1",
      history: [],
    })
  },
}))
