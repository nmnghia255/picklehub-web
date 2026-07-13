import type { TFunction } from "i18next"
import { toast } from "sonner"
import { create } from "zustand"

import {
  generateSeedsEventAction,
  getEventSeedingAction,
  lockSeedsEventAction,
  reorderSeedsAction,
} from "../../actions/seeding-actions"
import type { Seed } from "../../types/seeding"

function getTeamId(seed: Seed): string | undefined {
  if (seed.teamId) return String(seed.teamId)
  const teamObj = seed.team as unknown
  if (teamObj && typeof teamObj === "object") {
    const t = teamObj as { id?: number | string }
    if (t.id) return String(t.id)
  }
  return undefined
}

interface SeedingState {
  tournamentId: number | null
  selectedEventId: string
  seedsList: Seed[]
  isLoading: boolean
  isGenerating: boolean
  isLocking: boolean
  draggedIndex: number | null
  dragOverIndex: number | null

  // Actions
  setTournamentId: (id: number | null) => void
  setSelectedEventId: (id: string) => void
  setDraggedIndex: (index: number | null) => void
  setDragOverIndex: (index: number | null) => void
  fetchSeeding: (eventId: number, t: TFunction) => Promise<void>
  handleAutoSeed: (t: TFunction) => Promise<void>
  handleLockSeeding: (t: TFunction) => Promise<void>
  handleDrop: (dropIndex: number, t: TFunction) => Promise<void>
  reset: () => void
}

export const useSeedingStore = create<SeedingState>((set, get) => {
  const safeSetSeedsList = (data: unknown) => {
    if (Array.isArray(data)) {
      set({ seedsList: data })
      return
    }
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>
      if ("seeds" in obj && Array.isArray(obj.seeds)) {
        set({ seedsList: obj.seeds })
        return
      }
      if ("seeding" in obj && Array.isArray(obj.seeding)) {
        set({ seedsList: obj.seeding })
        return
      }
      if ("data" in obj && Array.isArray(obj.data)) {
        set({ seedsList: obj.data })
        return
      }
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) {
          set({ seedsList: obj[key] as Seed[] })
          return
        }
      }
    }
    set({ seedsList: [] })
  }

  return {
    tournamentId: null,
    selectedEventId: "",
    seedsList: [],
    isLoading: false,
    isGenerating: false,
    isLocking: false,
    draggedIndex: null,
    dragOverIndex: null,

    setTournamentId: (tournamentId) => set({ tournamentId }),
    setSelectedEventId: (selectedEventId) => set({ selectedEventId }),
    setDraggedIndex: (draggedIndex) => set({ draggedIndex }),
    setDragOverIndex: (dragOverIndex) => set({ dragOverIndex }),

    fetchSeeding: async (eventId, t) => {
      const { tournamentId } = get()
      if (!tournamentId) return
      set({ isLoading: true })
      try {
        const res = await getEventSeedingAction(tournamentId, eventId)
        if (res.success && res.data) {
          safeSetSeedsList(res.data)
        } else {
          set({ seedsList: [] })
        }
      } catch (err) {
        console.error("Failed to load seeding:", err)
        toast.error(
          t("seeding.errors.loadFailed", {
            defaultValue: "Failed to load seeding data",
          })
        )
        set({ seedsList: [] })
      } finally {
        set({ isLoading: false })
      }
    },

    handleAutoSeed: async (t) => {
      const { tournamentId, selectedEventId } = get()
      if (!tournamentId || !selectedEventId) return
      set({ isGenerating: true })
      try {
        const res = await generateSeedsEventAction(
          tournamentId,
          Number(selectedEventId)
        )
        if (res.success) {
          await get().fetchSeeding(Number(selectedEventId), t)
          toast.success(
            t("seeding.autoSeedSuccess", {
              defaultValue: "Seeds generated successfully",
            })
          )
        } else {
          toast.error(
            res.error ||
              t("seeding.errors.generateFailed", {
                defaultValue: "Failed to generate seeds",
              })
          )
        }
      } catch (err) {
        console.error(err)
        toast.error(
          t("seeding.errors.generateFailed", {
            defaultValue: "An error occurred while generating seeds",
          })
        )
      } finally {
        set({ isGenerating: false })
      }
    },

    handleLockSeeding: async (t) => {
      const { tournamentId, selectedEventId } = get()
      if (!tournamentId || !selectedEventId) return
      set({ isLocking: true })
      try {
        const res = await lockSeedsEventAction(
          tournamentId,
          Number(selectedEventId)
        )
        if (res.success && res.data) {
          safeSetSeedsList(res.data)
          toast.success(
            t("seeding.lockSuccess", {
              defaultValue: "Seeding locked successfully",
            })
          )
        } else {
          toast.error(
            res.error ||
              t("seeding.errors.lockFailed", {
                defaultValue: "Failed to lock seeding",
              })
          )
        }
      } catch (err) {
        console.error(err)
        toast.error(
          t("seeding.errors.lockFailed", {
            defaultValue: "An error occurred while locking seeding",
          })
        )
      } finally {
        set({ isLocking: false })
      }
    },

    handleDrop: async (dropIndex, t) => {
      const { tournamentId, selectedEventId, seedsList, draggedIndex } = get()
      if (
        !tournamentId ||
        !selectedEventId ||
        draggedIndex === null ||
        draggedIndex === dropIndex
      )
        return

      const updatedSeeds = [...seedsList]
      const [movedItem] = updatedSeeds.splice(draggedIndex, 1)
      updatedSeeds.splice(dropIndex, 0, movedItem)

      const reordered = updatedSeeds.map((item, idx) => ({
        ...item,
        seed: idx + 1,
      }))

      // Optimistic update
      set({
        seedsList: reordered,
        draggedIndex: null,
        dragOverIndex: null,
      })

      const payload = {
        seeds: reordered.map((s) => ({
          teamId: getTeamId(s),
          seed: s.seed,
        })),
      }

      try {
        const res = await reorderSeedsAction(
          tournamentId,
          Number(selectedEventId),
          payload
        )
        if (res.success && res.data) {
          safeSetSeedsList(res.data)
          toast.success(
            t("seeding.reorderSuccess", {
              defaultValue: "Seeding order saved successfully",
            })
          )
        } else {
          toast.error(
            res.error ||
              t("seeding.errors.reorderFailed", {
                defaultValue: "Failed to save seeding order",
              })
          )
          await get().fetchSeeding(Number(selectedEventId), t)
        }
      } catch (err) {
        console.error(err)
        toast.error(
          t("seeding.errors.reorderFailed", {
            defaultValue: "Failed to reorder seeds",
          })
        )
        await get().fetchSeeding(Number(selectedEventId), t)
      }
    },

    reset: () => {
      set({
        tournamentId: null,
        selectedEventId: "",
        seedsList: [],
        isLoading: false,
        isGenerating: false,
        isLocking: false,
        draggedIndex: null,
        dragOverIndex: null,
      })
    },
  }
})
