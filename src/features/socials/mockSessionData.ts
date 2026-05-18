import { currentUser, mockSocials } from "./mockData"
import type { Match, PlaySession, SessionParticipant, User } from "./types"

export function getSessionWithDetails(
  sessionId: string,
  socialId: string
): PlaySession | undefined {
  const social = mockSocials.find((s) => s.id === socialId)
  const base = social?.playSessions.find((p) => p.id === sessionId)
  if (!base) return undefined

  // Build minimal participants and matches for the mock session
  const participants: SessionParticipant[] = [
    // include current user if not already present
    {
      id: `part-${currentUser.id}`,
      userId: currentUser.id,
      user: currentUser as User,
      status: "CONFIRMED",
      joinedAt: new Date().toISOString(),
    },
  ]

  const matches: Match[] = []

  return {
    ...base,
    participants,
    matches,
  }
}

export default getSessionWithDetails
