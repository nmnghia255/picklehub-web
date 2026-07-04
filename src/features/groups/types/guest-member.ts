export type GuestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED"
  | "PENDING_APPROVAL" // legacy fallback
  | "ACTIVE" // legacy fallback
  | "INACTIVE" // legacy fallback

export interface Guest {
  id: string
  groupId: string
  memberId: string
  invitedById?: string // legacy fallback
  status: GuestStatus
  createdAt: string
  updatedAt: string
  member?: {
    id: string
    name: string
    avatarUrl?: string | null
  } | null
  invitedBy?: {
    id: string
    name: string
    avatarUrl?: string | null
  } | null // legacy fallback
  guestsCount: number
  guestCount?: number // legacy fallback
  sessionsCount: number
  sessionCount?: number // legacy fallback
  remainingSessions?: number
  note?: string | null
}

export interface CreateGuestInput {
  guestCount?: number
  sessionCount?: number
  guestsCount?: number
  sessionsCount?: number
}

export interface ApproveGuestsInput {
  guestIds: string[]
  status: "APPROVED" | "REJECTED" | "ACTIVE" // supporting legacy active/approved
}

export interface GuestListResponse {
  message: string
  data: Guest[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface GuestActionResponse {
  message: string
  data: {
    id: string
    status: GuestStatus
  }
}
