export interface PlaySession {
  id: string
  title: string
  socialId: string
  bookingIds: string[]
  joinedCount: number
  numberOfCourts: number
  courtNames: string
  location: string
  sessionFee: number
  startTime: string
  endTime: string
  status: string
  creatorId: string
  createdAt: string
  updatedAt: string
}

export interface PlaySessionRequest {
  title: string
  bookingIds: string[]
  startTime: string
  endTime: string
}

export interface PlaySessionParticipant {
  id: string
  playSessionId: string
  userId: string
  status: string
  isGuest: boolean
  guestName: string | null
  skillLevel: number | null
  joinedAt: string
  name: string
  avatarUrl: string | null
  selfRating: number | null
}

interface Session {
  id: string
  socialId: string
  status: string
  updatedAt: string
}

export interface StartPlaySessionResponse {
  session: Session
  seededParticipants: number
}

export interface CompletePlaySessionResponse {
  session: Session
  socialCascadedToCompleted: boolean
}
