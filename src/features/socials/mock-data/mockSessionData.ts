import type { Match, PlaySession, SessionParticipant, User } from "../types"

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

export const mockSessionParticipants: SessionParticipant[] = [
  {
    id: "sp-1",
    userId: "user-101",
    user: mockUsers[0],
    status: "CONFIRMED",
    joinedAt: "2026-05-15T10:00:00Z",
    skillLevel: 3.5,
  },
  {
    id: "sp-2",
    userId: "user-102",
    user: mockUsers[1],
    status: "CONFIRMED",
    joinedAt: "2026-05-15T10:30:00Z",
    skillLevel: 3.8,
  },
  {
    id: "sp-3",
    userId: "user-103",
    user: mockUsers[2],
    status: "CONFIRMED",
    joinedAt: "2026-05-15T11:00:00Z",
    skillLevel: 4.2,
  },
  {
    id: "sp-4",
    userId: "user-104",
    user: mockUsers[3],
    status: "CONFIRMED",
    joinedAt: "2026-05-15T11:30:00Z",
    skillLevel: 3.3,
  },
  {
    id: "sp-5",
    userId: "user-105",
    user: mockUsers[4],
    status: "CONFIRMED",
    joinedAt: "2026-05-15T12:00:00Z",
    skillLevel: 3.9,
  },
  {
    id: "sp-6",
    userId: "user-106",
    user: mockUsers[5],
    status: "CONFIRMED",
    joinedAt: "2026-05-15T12:30:00Z",
    skillLevel: 3.6,
  },
  {
    id: "sp-7",
    userId: "user-107",
    user: mockUsers[6],
    status: "CONFIRMED",
    joinedAt: "2026-05-15T13:00:00Z",
    skillLevel: 4.0,
  },
  {
    id: "sp-8",
    userId: "user-108",
    user: mockUsers[7],
    status: "CONFIRMED",
    joinedAt: "2026-05-15T13:30:00Z",
    skillLevel: 3.7,
  },
]

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

export function getSessionWithDetails(
  sessionId: string,
  socialId: string
): PlaySession | undefined {
  const session2Participants: SessionParticipant[] = mockSessionParticipants
    .slice(0, 6)
    .map((p, idx) => ({
      ...p,
      id: `sp-session2-${idx + 1}`,
    }))

  const sessions: Record<string, PlaySession> = {
    "session-1": {
      id: "session-1",
      title: "Morning Session - Courts 1 & 2",
      status: "PUBLISHED",
      maxSlots: 16,
      joinedCount: 10,
      startTime: "2026-05-24T09:00:00Z",
      endTime: "2026-05-24T11:00:00Z",
      creatorId: "user-2",
      socialId: "social-1",
      participants: mockSessionParticipants,
      matches: mockMatches,
    },
    "session-2": {
      id: "session-2",
      title: "Late Morning Session - Courts 3 & 4",
      status: "PUBLISHED",
      maxSlots: 16,
      joinedCount: 8,
      startTime: "2026-05-24T11:00:00Z",
      endTime: "2026-05-24T13:00:00Z",
      creatorId: "user-2",
      socialId: "social-1",
      participants: session2Participants,
      matches: [],
    },
  }

  return sessions[sessionId]
}
