// Minimal stub for session lookup used by PlaySessions pages during build
import type { PlaySession } from "@/features/socials/types"

export function getSessionWithDetails(sessionId: string, socialId?: string): PlaySession | undefined {
  if (!sessionId) return undefined

  const now = new Date().toISOString()

  return {
    id: sessionId,
    title: "Play Session",
    status: "ACTIVE",
    joinedCount: 0,
    maxSlots: 1,
    bookingIds: [],
    numberOfCourts: 1,
    sessionFee: 0,
    startTime: now,
    endTime: now,
    creatorId: "",
    socialId: socialId ?? "",
    participants: [
      {
        id: "p1",
        userId: "u1",
        status: "CONFIRMED",
        joinedAt: now,
      },
    ],
  }
}
