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
  maxParticipants: string
  entryFee: string
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
  name: "San Diego Summer Slam 2026",
  description: "",
  venue: "Balboa Park Tennis & Pickleball Center",
  startDate: "2026-06-15",
  endDate: "2026-06-17",
  banner: "",
  regOpen: "2026-05-01",
  regClose: "2026-06-10",
  maxParticipants: "200",
  entryFee: "150.000",
}

export const useCreateTournamentStore = create<CreateTournamentState>(
  (set) => ({
    currentStep: 1,
    formValues: initialFormValues,
    events: [
      {
        id: 1,
        name: "Men's Singles Open",
        type: "Singles",
        skillRange: "3.5-5.5",
        gender: "Men",
        capacity: 32,
        entryFee: 145,
        status: "open",
      },
      {
        id: 2,
        name: "Mixed Doubles 4.0",
        type: "Doubles",
        skillRange: "3.0-4.5",
        gender: "Mixed",
        capacity: 16,
        entryFee: 290,
        status: "open",
      },
    ],
    prizes: [
      {
        id: "1",
        name: "Men's Singles Winner Cash Prize",
        rewardType: "cash",
        value: 10000000,
        description:
          "Cash prize for the 1st place champion of Men's Singles Open",
        eventId: 1,
      },
      {
        id: "2",
        name: "Mixed Doubles Champion Medal",
        rewardType: "physical",
        value: 500000,
        description: "Gold medals for the winning pair of Mixed Doubles 4.0",
        eventId: 2,
      },
    ],

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
