"use client"

import { toast } from "sonner"
import { create } from "zustand"

import type { Match, Player } from "@/features/socials/types/match"
import i18n from "@/i18n/client"

interface HistoryEntry {
  state: MatchesGeneratorState
  timestamp: number
}

export interface MatchesGeneratorState {
  courts: number
  hours: number
  players: Player[]
  matches: Match[]
  scheduleTimes: string[]
  history: HistoryEntry[]
  historyIndex: number
}

interface MatchesGeneratorActions {
  // Configuration
  setCourts: (courts: number) => void
  setHours: (hours: number) => void
  setPlayers: (players: Player[]) => void
  setScheduleTimes: (scheduleTimes: string[]) => void

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

const isPlayer = (player: Player | null): player is Player => player !== null

const initialState: MatchesGeneratorState = {
  courts: 2,
  hours: 2,
  players: [],
  matches: [],
  scheduleTimes: [],
  history: [],
  historyIndex: -1,
}

export const useMatchesGeneratorStore = create<
  MatchesGeneratorState & MatchesGeneratorActions
>((set, get) => {
  const isPlayerInSession = (
    matches: Match[],
    playerId: string,
    sessionIndex: number,
    excludeMatchId?: string
  ): boolean => {
    return matches
      .filter((m) => m.sessionIndex === sessionIndex && m.id !== excludeMatchId)
      .some((m) => m.players.filter(isPlayer).some((p) => p.id === playerId))
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
      set(() => ({ hours }))
      updateStateWithHistory({ hours })
    },

    setPlayers: (players: Player[]) => {
      set(() => ({ players }))
      updateStateWithHistory({ players })
    },

    setScheduleTimes: (scheduleTimes: string[]) => {
      set(() => ({ scheduleTimes }))
      updateStateWithHistory({ scheduleTimes })
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
                players: m.players.map((player) =>
                  player?.id === playerId ? null : player
                ),
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
            ? (() => {
                const nextPlayers = [...m.players]
                const emptySlotIndex = nextPlayers.findIndex(
                  (slot) => slot === null
                )
                if (emptySlotIndex !== -1) {
                  nextPlayers[emptySlotIndex] = player
                } else {
                  nextPlayers.push(player)
                }

                return {
                  ...m,
                  players: nextPlayers,
                }
              })()
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

      const playerToMove = fromMatch.players
        .filter(isPlayer)
        .find((p) => p.id === fromPlayerId)
      if (!playerToMove) return false

      const playerToRemove = toPlayerId
        ? toMatch.players.filter(isPlayer).find((p) => p.id === toPlayerId)
        : null

      if (fromIndex !== toIndex) {
        // Check if fromPlayerId is already in toMatch's session
        if (
          isPlayerInSession(
            currentMatches,
            fromPlayerId,
            toMatch.sessionIndex,
            fromMatchId
          )
        ) {
          toast.error(i18n.t("matches.creation.playerAlreadyInSession"))
          return false
        }

        // Check if toPlayerId is already in fromMatch's session (if swapping, not just moving)
        if (
          toPlayerId &&
          isPlayerInSession(
            currentMatches,
            toPlayerId,
            fromMatch.sessionIndex,
            toMatchId
          )
        ) {
          toast.error(i18n.t("matches.creation.playerAlreadyInSession"))
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
          (p) => p?.id === fromPlayerId
        )
        if (fromPlayerIndex === -1) return false

        if (playerToRemove) {
          const toPlayerIndex = match.players.findIndex(
            (p) => p?.id === toPlayerId
          )
          if (toPlayerIndex === -1) return false

          match.players = match.players.map((player, index) => {
            if (index === fromPlayerIndex) return playerToRemove
            if (index === toPlayerIndex) return playerToMove
            return player
          })
        } else {
          match.players[fromPlayerIndex] = null
          const emptySlotIndex = match.players.findIndex(
            (slot) => slot === null
          )
          if (emptySlotIndex !== -1) {
            match.players[emptySlotIndex] = playerToMove
          } else {
            match.players.push(playerToMove)
          }
        }
      } else {
        const src = newMatches[fromIndex]
        const dst = newMatches[toIndex]

        if (playerToRemove) {
          // Swap across two different matches
          src.players = src.players.map((p) =>
            p?.id === fromPlayerId ? playerToRemove : p
          )
          dst.players = dst.players.map((p) =>
            p?.id === toPlayerId ? playerToMove : p
          )
        } else {
          // Move: remove from src and add to dst
          src.players = src.players.map((p) =>
            p?.id === fromPlayerId ? null : p
          )
          const emptySlotIndex = dst.players.findIndex((slot) => slot === null)
          if (emptySlotIndex !== -1) {
            dst.players[emptySlotIndex] = playerToMove
          } else {
            dst.players = [...dst.players, playerToMove]
          }
        }
      }

      // Normalize: dedupe and enforce max players per match
      for (const m of newMatches) {
        const seen = new Set<string>()
        const normalized: Array<Player | null> = []
        for (const p of m.players) {
          if (!p) {
            normalized.push(null)
            continue
          }
          if (!seen.has(p.id)) {
            seen.add(p.id)
            normalized.push(p)
          } else {
            normalized.push(null)
          }
        }
        const maxPlayers = m.matchType === "DOUBLES" ? 4 : 2
        m.players = normalized.slice(0, maxPlayers)
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
