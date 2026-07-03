"use client"

import { create } from "zustand"

import type { TournamentPrizeRequest } from "../types/prize"
import type { TournamentEvent } from "../types/tournament"

export interface TournamentFormValues {
  name: string
  description: string
  venue: string
  startDate: string
  endDate: string
  banner: string

  regOpen: string
  regClose: string

  paymentBankName: string
  paymentAccountName: string
  paymentAccountNumber: string
  paymentQrUrl: string
  paymentNote: string
}

export interface CreateTournamentState {
  currentStep: number
  formValues: TournamentFormValues
  events: TournamentEvent[]
  prizes: (TournamentPrizeRequest & { id: string })[]

  setCurrentStep: (step: number) => void
  setFormValue: <K extends keyof TournamentFormValues>(
    key: K,
    value: TournamentFormValues[K]
  ) => void
  resetForm: () => void

  setEvents: (events: TournamentEvent[]) => void
  addEvent: (event: Omit<TournamentEvent, "id" | "status">) => void
  deleteEvent: (id: string | number) => void
  updateEvent: (
    id: string | number,
    updatedEvent: Partial<Omit<TournamentEvent, "id" | "status">>
  ) => void

  setPrizes: (prizes: (TournamentPrizeRequest & { id: string })[]) => void
  addPrize: (prize: Omit<TournamentPrizeRequest, "id">) => void
  deletePrize: (id: string) => void
}

const initialFormValues: TournamentFormValues = {
  name: "",
  description: "",
  venue: "",
  startDate: "",
  endDate: "",
  banner: "",
  regOpen: "",
  regClose: "",
  paymentBankName: "",
  paymentAccountName: "",
  paymentAccountNumber: "",
  paymentQrUrl: "",
  paymentNote: "",
}

export const useCreateTournamentStore = create<CreateTournamentState>(
  (set) => ({
    currentStep: 1,
    formValues: initialFormValues,
    events: [],
    prizes: [],

    setCurrentStep: (step) => set({ currentStep: step }),
    setFormValue: (key, value) =>
      set((state) => ({
        formValues: {
          ...state.formValues,
          [key]: value,
        },
      })),
    resetForm: () =>
      set({
        currentStep: 1,
        formValues: initialFormValues,
        events: [],
        prizes: [],
      }),

    setEvents: (events) => set({ events }),
    addEvent: (newEvent) =>
      set((state) => ({
        events: [
          ...state.events,
          {
            ...newEvent,
            id: Date.now(),
            status: "open",
          } as TournamentEvent,
        ],
      })),
    deleteEvent: (id) =>
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      })),
    updateEvent: (id, updatedEvent) =>
      set((state) => ({
        events: state.events.map((e) =>
          e.id === id ? ({ ...e, ...updatedEvent } as TournamentEvent) : e
        ),
      })),

    setPrizes: (prizes) => set({ prizes }),
    addPrize: (newPrize) =>
      set((state) => ({
        prizes: [
          ...state.prizes,
          {
            ...newPrize,
            id: Date.now().toString(),
          },
        ],
      })),
    deletePrize: (id) =>
      set((state) => ({
        prizes: state.prizes.filter((p) => p.id !== id),
      })),
  })
)
