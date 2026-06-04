import type { PlaySession, PlaySessionParticipant } from "../types/play-session"

interface User {
  id: string
  name: string
  email: string
  avatar: string | null
}

const mockUsers: User[] = [
  {
    id: "user-101",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
  {
    id: "user-102",
    name: "Sarah Martinez",
    email: "sarah@example.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "user-103",
    name: "Mike Chen",
    email: "mike@example.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "user-104",
    name: "Emma Wilson",
    email: "emma@example.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: "user-105",
    name: "James Brown",
    email: "james@example.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    id: "user-106",
    name: "Lisa Anderson",
    email: "lisa@example.com",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
  },
  {
    id: "user-107",
    name: "David Lee",
    email: "david@example.com",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
  },
  {
    id: "user-108",
    name: "Maria Garcia",
    email: "maria@example.com",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
  },
]

export const mockSessionParticipants: PlaySessionParticipant[] = [
  {
    id: "sp-1",
    playSessionId: "session-1",
    userId: "user-101",
    status: "CONFIRMED",
    isGuest: false,
    guestName: null,
    joinedAt: "2026-05-15T10:00:00Z",
    skillLevel: 3.5,
    name: "Alex Johnson",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    selfRating: 3.5,
  },
  {
    id: "sp-2",
    playSessionId: "session-1",
    userId: "user-102",
    status: "CONFIRMED",
    isGuest: false,
    guestName: null,
    joinedAt: "2026-05-15T10:30:00Z",
    skillLevel: 3.8,
    name: "Sarah Martinez",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    selfRating: 3.8,
  },
  {
    id: "sp-3",
    playSessionId: "session-1",
    userId: "user-103",
    status: "CONFIRMED",
    isGuest: false,
    guestName: null,
    joinedAt: "2026-05-15T11:00:00Z",
    skillLevel: 4.2,
    name: "Mike Chen",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    selfRating: 4.2,
  },
  {
    id: "sp-4",
    playSessionId: "session-1",
    userId: "user-104",
    status: "CONFIRMED",
    isGuest: false,
    guestName: null,
    joinedAt: "2026-05-15T11:30:00Z",
    skillLevel: 3.3,
    name: "Emma Wilson",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    selfRating: 3.3,
  },
  {
    id: "sp-5",
    playSessionId: "session-1",
    userId: "user-105",
    status: "CONFIRMED",
    isGuest: false,
    guestName: null,
    joinedAt: "2026-05-15T12:00:00Z",
    skillLevel: 3.9,
    name: "James Brown",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    selfRating: 3.9,
  },
  {
    id: "sp-6",
    playSessionId: "session-1",
    userId: "user-106",
    status: "CONFIRMED",
    isGuest: false,
    guestName: null,
    joinedAt: "2026-05-15T12:30:00Z",
    skillLevel: 3.6,
    name: "Lisa Anderson",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    selfRating: 3.6,
  },
  {
    id: "sp-7",
    playSessionId: "session-1",
    userId: "user-107",
    status: "CONFIRMED",
    isGuest: false,
    guestName: null,
    joinedAt: "2026-05-15T13:00:00Z",
    skillLevel: 4.0,
    name: "David Lee",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    selfRating: 4.0,
  },
  {
    id: "sp-8",
    playSessionId: "session-1",
    userId: "user-108",
    status: "CONFIRMED",
    isGuest: false,
    guestName: null,
    joinedAt: "2026-05-15T13:30:00Z",
    skillLevel: 3.7,
    name: "Maria Garcia",
    avatarUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    selfRating: 3.7,
  },
]

export interface Match {
  id: string
  playSessionId: string
  courtNumber: number
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED"
  startTime: string
  endTime?: string
  team1: {
    player1: User
    player2: User
  }
  team2: {
    player1: User
    player2: User
  }
  score?: {
    team1Score: number
    team2Score: number
  }
}

export const mockMatches: Match[] = [
  {
    id: "match-1",
    playSessionId: "session-1",
    courtNumber: 1,
    status: "COMPLETED",
    startTime: "2026-05-24T09:00:00Z",
    endTime: "2026-05-24T09:45:00Z",
    team1: {
      player1: mockUsers[0],
      player2: mockUsers[1],
    },
    team2: {
      player1: mockUsers[2],
      player2: mockUsers[3],
    },
    score: {
      team1Score: 11,
      team2Score: 7,
    },
  },
  {
    id: "match-2",
    playSessionId: "session-1",
    courtNumber: 2,
    status: "COMPLETED",
    startTime: "2026-05-24T09:00:00Z",
    endTime: "2026-05-24T09:45:00Z",
    team1: {
      player1: mockUsers[4],
      player2: mockUsers[5],
    },
    team2: {
      player1: mockUsers[6],
      player2: mockUsers[7],
    },
    score: {
      team1Score: 11,
      team2Score: 9,
    },
  },
  {
    id: "match-3",
    playSessionId: "session-1",
    courtNumber: 1,
    status: "IN_PROGRESS",
    startTime: "2026-05-24T09:50:00Z",
    team1: {
      player1: mockUsers[0],
      player2: mockUsers[3],
    },
    team2: {
      player1: mockUsers[1],
      player2: mockUsers[2],
    },
  },
  {
    id: "match-4",
    playSessionId: "session-1",
    courtNumber: 2,
    status: "IN_PROGRESS",
    startTime: "2026-05-24T09:50:00Z",
    team1: {
      player1: mockUsers[4],
      player2: mockUsers[7],
    },
    team2: {
      player1: mockUsers[5],
      player2: mockUsers[6],
    },
  },
  {
    id: "match-5",
    playSessionId: "session-1",
    courtNumber: 1,
    status: "SCHEDULED",
    startTime: "2026-05-24T10:40:00Z",
    team1: {
      player1: mockUsers[2],
      player2: mockUsers[4],
    },
    team2: {
      player1: mockUsers[0],
      player2: mockUsers[6],
    },
  },
  {
    id: "match-6",
    playSessionId: "session-1",
    courtNumber: 2,
    status: "SCHEDULED",
    startTime: "2026-05-24T10:40:00Z",
    team1: {
      player1: mockUsers[1],
      player2: mockUsers[5],
    },
    team2: {
      player1: mockUsers[3],
      player2: mockUsers[7],
    },
  },
]

export const mockPlaySessions: PlaySession[] = [
  {
    id: "session-001",
    title: "Pickleball Morning Session",
    socialId: "social-001",
    bookingIds: ["booking-001", "booking-002"],
    joinedCount: 12,
    numberOfCourts: 2,
    courtNames: "Court A, Court B",
    location: "PickleHub Dĩ An",
    sessionFee: 50000,
    startTime: "2026-06-05T07:00:00Z",
    endTime: "2026-06-05T09:00:00Z",
    status: "ACTIVE",
    creatorId: "user-001",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-06-04T10:30:00Z",
  },
  {
    id: "session-002",
    title: "Evening Competitive Match",
    socialId: "social-002",
    bookingIds: ["booking-003"],
    joinedCount: 8,
    numberOfCourts: 1,
    courtNames: "Court C",
    location: "PickleHub Thủ Đức",
    sessionFee: 80000,
    startTime: "2026-06-06T17:30:00Z",
    endTime: "2026-06-06T20:00:00Z",
    status: "COMPLETED",
    creatorId: "user-002",
    createdAt: "2026-06-02T14:15:00Z",
    updatedAt: "2026-06-06T20:05:00Z",
  },
]
