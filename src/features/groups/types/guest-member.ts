export type GuestStatus =
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "INACTIVE"
  | "REJECTED"

export interface Guest {
  id: string
  groupId: string
  name: string
  email: string
  skillLevel: string
  phone: string | null
  gender: "MALE" | "FEMALE" | null
  invitedById: string
  status: GuestStatus
  createdAt: string
  updatedAt: string
  invitedBy?: {
    id: string
    name: string
    avatarUrl?: string | null
  } | null
}

export interface CreateGuestInput {
  name: string
  email: string
  skillLevel: string
  phone?: string
  gender?: "MALE" | "FEMALE"
}

export interface ApproveGuestsInput {
  guestIds: string[]
  status: "ACTIVE" | "REJECTED"
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
