import { Court } from "../types/court"
import type { Match } from "../types/match"
import type { Player } from "../types/player"

export const liveScores: Match[] = [
  {
    id: 1,
    court: "Court 1",
    event: "Men's Singles 4.0",
    team1: "Martinez",
    team2: "Chen",
    score: "9-7",
    status: "in_progress",
  },
  {
    id: 2,
    court: "Court 2",
    event: "Women's Doubles 3.5",
    team1: "Smith/Johnson",
    team2: "Williams/Brown",
    score: "11-9",
    status: "completed",
  },
  {
    id: 3,
    court: "Court 3",
    event: "Mixed Doubles 4.5",
    team1: "Garcia/Davis",
    team2: "Miller/Wilson",
    score: "6-4",
    status: "in_progress",
  },
]
export const participants: Player[] = [
  {
    name: "James Martinez",
    rating: 4.2,
    event: "Men's Doubles 4.0",
    avatar: "JM",
  },
  { name: "David Chen", rating: 4.1, event: "Men's Doubles 4.0", avatar: "DC" },
  {
    name: "Sarah Johnson",
    rating: 3.8,
    event: "Women's Singles 3.5",
    avatar: "SJ",
  },
  {
    name: "Michael Roberts",
    rating: 4.5,
    event: "Mixed Doubles 4.5",
    avatar: "MR",
  },
  {
    name: "Emily White",
    rating: 3.5,
    event: "Women's Singles 3.5",
    avatar: "EW",
  },
  {
    name: "Robert Clark",
    rating: 5.2,
    event: "Men's Singles 5.0",
    avatar: "RC",
  },
]
