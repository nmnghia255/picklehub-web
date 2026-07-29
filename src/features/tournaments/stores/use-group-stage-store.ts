import type { TFunction } from "i18next"
import { toast } from "sonner"
import { create } from "zustand"

import {
  advanceTeamsAction,
  configureGroupStageAction,
  drawGroupsAction,
  generateMatchesAction,
  listGroupsAction,
} from "../actions/group-stage-actions"
import { getEventSeedingAction } from "../actions/seeding-actions"
import type { Group } from "../types/group-stage"
import type { Seed } from "../types/seeding"
import { useTournamentDashboardStore } from "./tournament-dashboard-store"

function safeExtractSeedsList(data: unknown): Seed[] {
  if (Array.isArray(data)) {
    return data
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>
    if ("seeds" in obj && Array.isArray(obj.seeds)) {
      return obj.seeds
    }
    if ("seeding" in obj && Array.isArray(obj.seeding)) {
      return obj.seeding
    }
    if ("data" in obj && Array.isArray(obj.data)) {
      return obj.data
    }
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) {
        return obj[key] as Seed[]
      }
    }
  }
  return []
}

interface GroupStageState {
  tournamentId: number | null
  selectedEventId: string
  numGroups: number
  advancePerGroup: number
  groups: Group[]
  seedsList: Seed[]
  selectedPriorityTeamIds: string[]
  totalAdvance: number

  // Loading states
  isLoadingData: boolean
  isSavingConfig: boolean
  isDrawing: boolean
  isGeneratingMatches: boolean
  isAdvancing: boolean

  // Actions
  setTournamentId: (id: number) => void
  setSelectedEventId: (id: string) => void
  setNumGroups: (num: number) => void
  setAdvancePerGroup: (num: number) => void
  setSelectedPriorityTeamIds: (ids: string[]) => void
  togglePriorityTeamId: (id: string) => void
  setTotalAdvance: (num: number) => void

  fetchData: (t: TFunction) => Promise<void>
  saveConfig: (t: TFunction) => Promise<void>
  drawGroups: (t: TFunction) => Promise<void>
  generateMatches: (t: TFunction) => Promise<void>
  advanceTeams: (t: TFunction) => Promise<void>
  reset: () => void
}

export const useGroupStageStore = create<GroupStageState>((set, get) => ({
  tournamentId: null,
  selectedEventId: "",
  numGroups: 4,
  advancePerGroup: 2,
  groups: [],
  seedsList: [],
  selectedPriorityTeamIds: [],
  totalAdvance: 8,

  isLoadingData: false,
  isSavingConfig: false,
  isDrawing: false,
  isGeneratingMatches: false,
  isAdvancing: false,

  setTournamentId: (tournamentId) => set({ tournamentId }),
  setSelectedEventId: (selectedEventId) => set({ selectedEventId }),
  setNumGroups: (numGroups) => set({ numGroups }),
  setAdvancePerGroup: (advancePerGroup) => set({ advancePerGroup }),
  setSelectedPriorityTeamIds: (selectedPriorityTeamIds) =>
    set({ selectedPriorityTeamIds }),
  togglePriorityTeamId: (id) => {
    const { selectedPriorityTeamIds } = get()
    const next = selectedPriorityTeamIds.includes(id)
      ? selectedPriorityTeamIds.filter((x) => x !== id)
      : [...selectedPriorityTeamIds, id]
    set({ selectedPriorityTeamIds: next })
  },
  setTotalAdvance: (totalAdvance) => set({ totalAdvance }),

  fetchData: async (_t) => {
    const { tournamentId, selectedEventId } = get()
    if (!tournamentId || !selectedEventId) return

    set({ isLoadingData: true })
    const eventId = Number(selectedEventId)

    try {
      // 1. Fetch group standings
      const groupRes = await listGroupsAction(tournamentId, eventId)
      if (groupRes.success && groupRes.data) {
        set({ groups: groupRes.data })
      } else {
        set({ groups: [] })
      }

      // 2. Fetch event seeds (for priority drawing list)
      const seedsRes = await getEventSeedingAction(tournamentId, eventId)
      if (seedsRes.success && seedsRes.data) {
        set({ seedsList: safeExtractSeedsList(seedsRes.data) })
      } else {
        set({ seedsList: [] })
      }
    } catch (err) {
      console.error("Failed to load group stage data:", err)
      set({ groups: [], seedsList: [] })
    } finally {
      set({ isLoadingData: false })
    }
  },

  saveConfig: async (t) => {
    const {
      tournamentId,
      selectedEventId,
      numGroups,
      totalAdvance,
      groups,
      seedsList,
    } = get()
    if (!tournamentId || !selectedEventId) return

    if (numGroups < 2) {
      toast.error(
        t("groupStage.minGroupsError", {
          defaultValue: "Number of groups must be at least 2.",
        })
      )
      return
    }

    const dashboardStore = useTournamentDashboardStore.getState()
    const selectedEvent = dashboardStore.events?.find(
      (e) => e.id.toString() === selectedEventId
    )

    const safeSeeds = Array.isArray(seedsList) ? seedsList : []
    const totalTeamsFromGroups = Array.isArray(groups)
      ? groups.reduce((acc, g) => acc + (g.memberships?.length || 0), 0)
      : 0
    const totalTeams =
      totalTeamsFromGroups > 0
        ? totalTeamsFromGroups
        : safeSeeds.length > 0
          ? safeSeeds.length
          : Math.max(
              selectedEvent?.capacity ?? 0,
              selectedEvent?.participants ?? 0
            )

    if (totalTeams > 0 && numGroups >= totalTeams) {
      toast.error(
        t("groupStage.maxGroupsError", {
          defaultValue:
            "Number of groups must be smaller than total teams ({{total}}).",
          total: totalTeams,
        })
      )
      return
    }

    if (totalTeams > 0 && totalAdvance >= totalTeams) {
      toast.error(
        t("groupStage.maxAdvanceError", {
          defaultValue:
            "Number of advancing teams must be smaller than total teams ({{total}}).",
          total: totalTeams,
        })
      )
      return
    }

    if (totalAdvance < numGroups) {
      toast.error(
        t("groupStage.minAdvanceError", {
          defaultValue:
            "Number of advancing teams must be at least the number of groups ({{numGroups}}).",
          numGroups,
        })
      )
      return
    }

    set({ isSavingConfig: true })
    try {
      const res = await configureGroupStageAction(
        tournamentId,
        Number(selectedEventId),
        {
          numGroups,
          advanceMethod: "standard",
          totalAdvance,
        }
      )
      if (res.success) {
        toast.success(
          t("groupStage.configSuccess", {
            defaultValue: "Configuration saved successfully",
          })
        )

        // Sync new group config to dashboard events list to disable config inputs & save button immediately
        if (dashboardStore.events) {
          const updatedEvents = dashboardStore.events.map((e) =>
            e.id.toString() === selectedEventId
              ? {
                  ...e,
                  numGroups,
                  totalAdvance,
                  advanceMethod: "standard",
                }
              : e
          )
          useTournamentDashboardStore.setState({ events: updatedEvents })
        }
      } else {
        toast.error(
          res.error ||
            t("groupStage.configFailed", {
              defaultValue: "Failed to save configuration",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("groupStage.configFailed", {
          defaultValue: "Failed to save configuration",
        })
      )
    } finally {
      set({ isSavingConfig: false })
    }
  },

  drawGroups: async (t) => {
    const { tournamentId, selectedEventId, selectedPriorityTeamIds } = get()
    if (!tournamentId || !selectedEventId) return

    set({ isDrawing: true })
    try {
      const priorityTeamIds = selectedPriorityTeamIds
        .map(Number)
        .filter((id) => !isNaN(id))

      const res = await drawGroupsAction(
        tournamentId,
        Number(selectedEventId),
        { priorityTeamIds }
      )
      if (res.success && res.data) {
        set({ groups: res.data })
        toast.success(
          t("groupStage.drawSuccess", {
            defaultValue: "Groups drawn successfully",
          })
        )
      } else {
        toast.error(
          res.error ||
            t("groupStage.drawFailed", {
              defaultValue: "Failed to draw groups",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("groupStage.drawFailed", { defaultValue: "Failed to draw groups" })
      )
    } finally {
      set({ isDrawing: false })
    }
  },

  generateMatches: async (t) => {
    const { tournamentId, selectedEventId } = get()
    if (!tournamentId || !selectedEventId) return

    set({ isGeneratingMatches: true })
    try {
      const res = await generateMatchesAction(
        tournamentId,
        Number(selectedEventId)
      )
      if (res.success) {
        toast.success(
          t("groupStage.matchesSuccess", {
            defaultValue: "Group matches generated successfully",
          })
        )
      } else {
        toast.error(
          res.error ||
            t("groupStage.matchesFailed", {
              defaultValue: "Failed to generate matches",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("groupStage.matchesFailed", {
          defaultValue: "Failed to generate matches",
        })
      )
    } finally {
      set({ isGeneratingMatches: false })
    }
  },

  advanceTeams: async (t) => {
    const { tournamentId, selectedEventId, totalAdvance, groups, seedsList } =
      get()
    if (!tournamentId || !selectedEventId) return

    const dashboardStore = useTournamentDashboardStore.getState()
    const selectedEvent = dashboardStore.events?.find(
      (e) => e.id.toString() === selectedEventId
    )

    const safeSeeds = Array.isArray(seedsList) ? seedsList : []
    const totalTeamsFromGroups = Array.isArray(groups)
      ? groups.reduce((acc, g) => acc + (g.memberships?.length || 0), 0)
      : 0
    const totalTeams =
      totalTeamsFromGroups > 0
        ? totalTeamsFromGroups
        : safeSeeds.length > 0
          ? safeSeeds.length
          : Math.max(
              selectedEvent?.capacity ?? 0,
              selectedEvent?.participants ?? 0
            )

    if (totalTeams > 0 && totalAdvance >= totalTeams) {
      toast.error(
        t("groupStage.maxAdvanceError", {
          defaultValue:
            "Number of advancing teams must be smaller than total teams ({{total}}).",
          total: totalTeams,
        })
      )
      return
    }

    set({ isAdvancing: true })
    try {
      const res = await advanceTeamsAction(
        tournamentId,
        Number(selectedEventId),
        { totalAdvance }
      )
      if (res.success && res.data) {
        toast.success(
          t("groupStage.advanceSuccess", {
            defaultValue: `Successfully advanced ${res.data.advancedTeamsCount} teams to knockout stage`,
            count: res.data.advancedTeamsCount,
          })
        )
        // Refresh standings/groups to show advanced state
        await get().fetchData(t)
      } else {
        toast.error(
          res.error ||
            t("groupStage.advanceFailed", {
              defaultValue: "Failed to advance teams",
            })
        )
      }
    } catch (err) {
      console.error(err)
      toast.error(
        t("groupStage.advanceFailed", {
          defaultValue: "Failed to advance teams",
        })
      )
    } finally {
      set({ isAdvancing: false })
    }
  },

  reset: () =>
    set({
      tournamentId: null,
      selectedEventId: "",
      numGroups: 4,
      advancePerGroup: 2,
      groups: [],
      seedsList: [],
      selectedPriorityTeamIds: [],
      totalAdvance: 8,
      isLoadingData: false,
      isSavingConfig: false,
      isDrawing: false,
      isGeneratingMatches: false,
      isAdvancing: false,
    }),
}))
