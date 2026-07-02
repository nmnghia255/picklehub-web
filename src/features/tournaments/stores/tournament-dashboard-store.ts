import { create } from "zustand"

import { getFinanceSummaryAction } from "../actions/finance-actions"
import { getTournamentFixturesWithScheduleAction } from "../actions/schedule-actions"
import { changeTournamentStatusAction } from "../actions/tournament-actions"
import type { TournamentPrize } from "../types/prize"
import type { TournamentSchedule } from "../types/schedule"
import type { Sponsor } from "../types/sponsor"
import type { Tournament, TournamentStatus } from "../types/tournament"
import type { TournamentEvent } from "../types/tournament-event"

interface TournamentDashboardState {
  tournament: Tournament | null
  events: TournamentEvent[]
  prizes: TournamentPrize[]
  sponsors: Sponsor[]
  isHost: boolean
  matchesCount: number | null
  completedMatchesCount: number | null
  revenue: number | null
  loadingStats: boolean
  updatingStatus: boolean

  // Actions
  setInitialData: (data: {
    tournament: Tournament
    events: TournamentEvent[]
    prizes?: TournamentPrize[]
    sponsors?: Sponsor[]
    isHost?: boolean
  }) => void
  fetchStats: () => Promise<void>
  advanceStatus: (
    t: (key: string, options?: Record<string, unknown>) => string,
    formatDateWithYear: (dateStr: string | null) => string
  ) => Promise<{ success: boolean; errors?: string[]; error?: string }>
}

export const useTournamentDashboardStore = create<TournamentDashboardState>(
  (set, get) => ({
    tournament: null,
    events: [],
    prizes: [],
    sponsors: [],
    isHost: false,
    matchesCount: null,
    completedMatchesCount: null,
    revenue: null,
    loadingStats: true,
    updatingStatus: false,

    setInitialData: (data) => {
      set({
        tournament: data.tournament,
        events: data.events,
        prizes: data.prizes || [],
        sponsors: data.sponsors || [],
        isHost: data.isHost || false,
      })
    },

    fetchStats: async () => {
      const { tournament } = get()
      if (!tournament) return

      set({ loadingStats: true })
      try {
        const [fixturesRes, financeRes] = await Promise.all([
          getTournamentFixturesWithScheduleAction(tournament.id),
          getFinanceSummaryAction(tournament.id.toString()),
        ])

        let matchesCount = 0
        let completedCount = 0
        let revenue = 0

        if (fixturesRes.success && fixturesRes.data) {
          let fixturesList: TournamentSchedule[] = []
          if (Array.isArray(fixturesRes.data)) {
            fixturesList = fixturesRes.data as TournamentSchedule[]
          } else if (fixturesRes.data && typeof fixturesRes.data === "object") {
            if (
              "fixtures" in fixturesRes.data &&
              Array.isArray(
                (fixturesRes.data as Record<string, unknown>).fixtures
              )
            ) {
              fixturesList = (
                fixturesRes.data as { fixtures: TournamentSchedule[] }
              ).fixtures
            } else if (
              "data" in fixturesRes.data &&
              Array.isArray((fixturesRes.data as Record<string, unknown>).data)
            ) {
              fixturesList = (
                fixturesRes.data as { data: TournamentSchedule[] }
              ).data
            }
          }

          matchesCount = fixturesList.length
          completedCount = fixturesList.filter(
            (m) => m.status === "completed"
          ).length
        }

        if (financeRes.success && financeRes.data) {
          revenue = financeRes.data.summary.totalIncome ?? 0
        }

        set({
          matchesCount,
          completedMatchesCount: completedCount,
          revenue,
        })
      } catch (error) {
        console.error("Failed to load dashboard stats", error)
        set({
          matchesCount: 0,
          completedMatchesCount: 0,
          revenue: 0,
        })
      } finally {
        set({ loadingStats: false })
      }
    },

    advanceStatus: async (t, formatDateWithYear) => {
      const {
        tournament,
        events,
        prizes,
        sponsors,
        matchesCount,
        completedMatchesCount,
      } = get()

      if (!tournament) {
        return { success: false, error: "No tournament loaded" }
      }

      const currentStatus = tournament.status
      let nextStatus: TournamentStatus | null = null
      const errors: string[] = []

      if (currentStatus === "draft") {
        nextStatus = "published"
        if (!events || events.length === 0) {
          errors.push(
            t("dashboard.validation.requireEvent", {
              defaultValue: "Requires at least one event setup.",
            })
          )
        }
        if (!prizes || prizes.length === 0) {
          errors.push(
            t("dashboard.validation.requirePrize", {
              defaultValue: "Requires tournament prizes setup.",
            })
          )
        }
        const hasPayment =
          tournament.paymentBankName &&
          tournament.paymentAccountName &&
          tournament.paymentAccountNumber
        if (!hasPayment) {
          errors.push(
            t("dashboard.validation.requirePayment", {
              defaultValue:
                "Requires complete payment configuration (bank, account name, account number).",
            })
          )
        }
        if (!sponsors || sponsors.length === 0) {
          errors.push(
            t("dashboard.validation.requireSponsor", {
              defaultValue: "Requires at least one sponsor setup.",
            })
          )
        }
      } else if (currentStatus === "published") {
        nextStatus = "open_registration"
        if (tournament.registrationStartDate) {
          const startDate = new Date(tournament.registrationStartDate)
          if (new Date() < startDate) {
            errors.push(
              t("dashboard.validation.waitOpenRegistration", {
                defaultValue:
                  "Wait until the registration start date ({{date}}) to open registration.",
                date: formatDateWithYear(tournament.registrationStartDate),
              })
            )
          }
        } else {
          errors.push(
            t("dashboard.validation.noOpenDate", {
              defaultValue: "No registration start date configured.",
            })
          )
        }
      } else if (currentStatus === "open_registration") {
        nextStatus = "closed_registration"
        if (tournament.registrationEndDate) {
          const endDate = new Date(tournament.registrationEndDate)
          if (new Date() < endDate) {
            errors.push(
              t("dashboard.validation.waitCloseRegistration", {
                defaultValue:
                  "Wait until the registration end date ({{date}}) to close registration.",
                date: formatDateWithYear(tournament.registrationEndDate),
              })
            )
          }
        } else {
          errors.push(
            t("dashboard.validation.noCloseDate", {
              defaultValue: "No registration end date configured.",
            })
          )
        }
      } else if (currentStatus === "closed_registration") {
        nextStatus = "in_progress"
        if (tournament.startDate) {
          const startDate = new Date(tournament.startDate)
          if (new Date() < startDate) {
            errors.push(
              t("dashboard.validation.waitStartDate", {
                defaultValue:
                  "Wait until the tournament start date ({{date}}) to begin the tournament.",
                date: formatDateWithYear(tournament.startDate),
              })
            )
          }
        } else {
          errors.push(
            t("dashboard.validation.noStartDate", {
              defaultValue: "No tournament start date configured.",
            })
          )
        }
        if (matchesCount === null || matchesCount === 0) {
          errors.push(
            t("dashboard.validation.requireSchedule", {
              defaultValue:
                "Requires seeding, group stage, and schedule/matches generated.",
            })
          )
        }
      } else if (currentStatus === "in_progress") {
        nextStatus = "completed"
        if (matchesCount === null || matchesCount === 0) {
          errors.push(
            t("dashboard.validation.noMatches", {
              defaultValue: "No matches generated for this tournament.",
            })
          )
        } else if (completedMatchesCount !== matchesCount) {
          errors.push(
            t("dashboard.validation.waitAllMatchesCompleted", {
              defaultValue:
                "All matches must be completed ({{completed}}/{{total}} completed).",
              completed: completedMatchesCount ?? 0,
              total: matchesCount,
            })
          )
        }
      }

      if (errors.length > 0) {
        return { success: false, errors }
      }

      if (!nextStatus) {
        return { success: false, error: "Invalid status transition" }
      }

      set({ updatingStatus: true })
      try {
        const res = await changeTournamentStatusAction(
          tournament.id.toString(),
          nextStatus
        )
        if (res.success) {
          set((state) => ({
            tournament: state.tournament
              ? { ...state.tournament, status: nextStatus! }
              : null,
          }))
          return { success: true }
        } else {
          return {
            success: false,
            error: res.error || "Failed to update tournament status.",
          }
        }
      } catch (err: unknown) {
        const errMsg =
          err instanceof Error
            ? err.message
            : "An error occurred while updating status."
        return { success: false, error: errMsg }
      } finally {
        set({ updatingStatus: false })
      }
    },
  })
)
