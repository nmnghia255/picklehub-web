import type { AddOn } from "./types"

export const TIME_SLOTS = [
  "06:00 - 07:00",
  "07:00 - 08:00",
  "08:00 - 09:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
]

export const BOOKED_SLOTS: Record<number, string[]> = {
  1: ["06:00 - 07:00", "07:00 - 08:00"],
  2: ["18:00 - 19:00"],
  3: ["17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00"],
  4: [],
  5: ["08:00 - 09:00", "19:00 - 20:00"],
  6: ["06:00 - 07:00"],
  7: [],
  8: ["17:00 - 18:00"],
}

export const ADD_ONS: AddOn[] = [
  { key: "paddle", label: "Paddle rental", price: 3 },
  { key: "balls", label: "Ball set", price: 2 },
  { key: "coach", label: "Warm-up coach (30m)", price: 12 },
]

export const COURT_PRICE = 14
