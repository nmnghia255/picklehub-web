"use client"

import { toast } from "sonner"
import { create } from "zustand"

interface Match {
  id: string
  courtId: string
  sessionIndex: number
  matchType: "SINGLES" | "DOUBLES"
  players: Player[]
}

interface Player {
  id: string
  name: string
  skillLevel?: number
  avatarUrl?: string | null
}

interface HistoryEntry {
  state: MatchesGeneratorState
  timestamp: number
}

export interface MatchesGeneratorState {
  courts: number
  hours: number
  players: Player[]
  matches: Match[]
  history: HistoryEntry[]
  historyIndex: number
}

interface MatchesGeneratorActions {
  // Configuration
  setCourts: (courts: number) => void
  setHours: (hours: number) => void

  // Match Management
  setMatches: (matches: Match[]) => void
  updateMatch: (match: Match) => void
  removePlayerFromMatch: (matchId: string, playerId: string) => void
  addPlayerToMatch: (matchId: string, playerId: string) => void
  changeMatchType: (matchId: string, matchType: "SINGLES" | "DOUBLES") => void
  swapPlayers: (
    fromMatchId: string,
    toMatchId: string,
    fromPlayerId: string,
    toPlayerId: string | null
  ) => boolean

  // History Management
  undo: () => void
  redo: () => void

  // Reset
  reset: () => void
}

const initialState: MatchesGeneratorState = {
  courts: 2,
  hours: 2,
  players: [
    { id: "1", name: "John Doe", skillLevel: 3 },
    { id: "2", name: "Jane Smith", skillLevel: 4 },
    { id: "3", name: "Bob Johnson", skillLevel: 2 },
    { id: "4", name: "Alice Williams", skillLevel: 3 },
    { id: "5", name: "Charlie Brown", skillLevel: 5 },
    { id: "6", name: "Diana Prince", skillLevel: 4 },
    { id: "7", name: "Eve Davis", skillLevel: 2 },
    { id: "8", name: "Frank Miller", skillLevel: 3 },
  ],
  matches: [],
  history: [],
  historyIndex: -1,
}

export const useMatchesGeneratorStore = create<
  MatchesGeneratorState & MatchesGeneratorActions
>((set, get) => {
  const isPlayerInSession = (
    matches: Match[],
    playerId: string,
    sessionIndex: number
  ): boolean => {
    return matches
      .filter((m) => m.sessionIndex === sessionIndex)
      .some((m) => m.players.some((p) => p.id === playerId))
  }

  // Helper to add state to history
  const updateStateWithHistory = (newState: Partial<MatchesGeneratorState>) => {
    const currentState = get()
    const mergedState = { ...currentState, ...newState }

    // Create history entry
    const historyEntry: HistoryEntry = {
      state: mergedState,
      timestamp: Date.now(),
    }

    // Remove any redo history if we make a new change
    const newHistory = currentState.history.slice(
      0,
      currentState.historyIndex + 1
    )

    set({
      ...newState,
      history: [...newHistory, historyEntry],
      historyIndex: newHistory.length,
    })
  }

  return {
    // Initial state
    ...initialState,

    // Configuration actions
    setCourts: (courts: number) => {
      updateStateWithHistory({ courts })
    },

    setHours: (hours: number) => {
      updateStateWithHistory({ hours })
    },

    // Match management actions
    setMatches: (matches: Match[]) => {
      updateStateWithHistory({ matches })
    },

    updateMatch: (updatedMatch: Match) => {
      const currentMatches = get().matches
      updateStateWithHistory({
        matches: currentMatches.map((m) =>
          m.id === updatedMatch.id ? updatedMatch : m
        ),
      })
    },

    removePlayerFromMatch: (matchId: string, playerId: string) => {
      const currentMatches = get().matches
      updateStateWithHistory({
        matches: currentMatches.map((m) =>
          m.id === matchId
            ? {
                ...m,
                players: m.players.filter((p) => p.id !== playerId),
              }
            : m
        ),
      })
    },

    addPlayerToMatch: (matchId: string, playerId: string) => {
      const player = get().players.find((p) => p.id === playerId)
      if (!player) return

      const currentMatches = get().matches
      updateStateWithHistory({
        matches: currentMatches.map((m) =>
          m.id === matchId
            ? {
                ...m,
                players: [...m.players, player],
              }
            : m
        ),
      })
    },

    changeMatchType: (matchId: string, matchType: "SINGLES" | "DOUBLES") => {
      const currentMatches = get().matches
      updateStateWithHistory({
        matches: currentMatches.map((m) =>
          m.id === matchId
            ? {
                ...m,
                matchType,
                players: m.players.slice(0, matchType === "SINGLES" ? 2 : 4),
              }
            : m
        ),
      })
    },

    swapPlayers: (
      fromMatchId: string,
      toMatchId: string,
      fromPlayerId: string,
      toPlayerId: string | null
    ): boolean => {
      const currentMatches = get().matches
      const fromIndex = currentMatches.findIndex((m) => m.id === fromMatchId)
      const toIndex = currentMatches.findIndex((m) => m.id === toMatchId)

      if (fromIndex === -1 || toIndex === -1) return false

      const fromMatch = currentMatches[fromIndex]
      const toMatch = currentMatches[toIndex]

      const playerToMove = fromMatch.players.find((p) => p.id === fromPlayerId)
      if (!playerToMove) return false

      const playerToRemove = toPlayerId
        ? toMatch.players.find((p) => p.id === toPlayerId)
        : null

      if (fromIndex !== toIndex) {
        // Check if fromPlayerId is already in toMatch's session
        if (
          isPlayerInSession(currentMatches, fromPlayerId, toMatch.sessionIndex)
        ) {
          toast.error(
            "Cầu thủ này đã xuất hiện trong phiên chơi này. Không thể thêm vào trận khác trong cùng phiên."
          )
          return false
        }

        // Check if toPlayerId is already in fromMatch's session (if swapping, not just moving)
        if (
          toPlayerId &&
          isPlayerInSession(currentMatches, toPlayerId, fromMatch.sessionIndex)
        ) {
          toast.error(
            "Cầu thủ này đã xuất hiện trong phiên chơi này. Không thể thêm vào trận khác trong cùng phiên."
          )
          return false
        }
      }

      // Work on shallow copies
      const newMatches = currentMatches.map((m) => ({
        ...m,
        players: [...m.players],
      }))

      if (fromIndex === toIndex) {
        const match = newMatches[fromIndex]
        const fromPlayerIndex = match.players.findIndex(
          (p) => p.id === fromPlayerId
        )
        if (fromPlayerIndex === -1) return false

        if (playerToRemove) {
          const toPlayerIndex = match.players.findIndex(
            (p) => p.id === toPlayerId
          )
          if (toPlayerIndex === -1) return false

          match.players = match.players.map((player, index) => {
            if (index === fromPlayerIndex) return playerToRemove
            if (index === toPlayerIndex) return playerToMove
            return player
          })
        } else {
          match.players = [
            ...match.players.slice(0, fromPlayerIndex),
            ...match.players.slice(fromPlayerIndex + 1),
          ]
          match.players.push(playerToMove)
        }
      } else {
        const src = newMatches[fromIndex]
        const dst = newMatches[toIndex]

        if (playerToRemove) {
          // Swap across two different matches
          src.players = src.players.map((p) =>
            p.id === fromPlayerId ? playerToRemove : p
          )
          dst.players = dst.players.map((p) =>
            p.id === toPlayerId ? playerToMove : p
          )
        } else {
          // Move: remove from src and add to dst
          src.players = src.players.filter((p) => p.id !== fromPlayerId)
          dst.players = [...dst.players, playerToMove]
        }
      }

      // Normalize: dedupe and enforce max players per match
      for (const m of newMatches) {
        const seen = new Set<string>()
        const deduped: Player[] = []
        for (const p of m.players) {
          if (!seen.has(p.id)) {
            seen.add(p.id)
            deduped.push(p)
          }
        }
        const maxPlayers = m.matchType === "DOUBLES" ? 4 : 2
        m.players = deduped.slice(0, maxPlayers)
      }

      updateStateWithHistory({ matches: newMatches })
      return true
    },

    // History actions
    undo: () => {
      const { history, historyIndex } = get()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        const previousState = history[newIndex].state
        set({ ...previousState, historyIndex: newIndex })
      }
    },

    redo: () => {
      const { history, historyIndex } = get()
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        const nextState = history[newIndex].state
        set({ ...nextState, historyIndex: newIndex })
      }
    },

    // Reset
    reset: () => {
      set(initialState)
    },
  }
})
