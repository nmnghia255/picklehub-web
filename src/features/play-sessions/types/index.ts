export type Participant = {
  id: string
  playSessionId: string
  userId: string
  status: "CONFIRMED" | "WAITLISTED" | "ON_HOLD" | "LEFT" | "KICKED"
  guestsCount?: number
  paymentStatus?: "UNPAID" | "PENDING_REVIEW" | "PAID"
  isCheckedIn?: boolean
  joinedAt: string
  name?: string
  avatarUrl?: string | null
}

export type ParticipantsResponse = {
  message: string
  data: Participant[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PlaySessionParticipant {
  id: string
  playSessionId: string
  userId: string
  status: string
  guestsCount?: number
  paymentStatus?: "UNPAID" | "PENDING_REVIEW" | "PAID" | string
  isCheckedIn?: boolean
  joinedAt?: string
  name?: string | null
  avatarUrl?: string | null
}

export type PlaySessionGuestType = "DROP_IN" | "RESERVED"

export type PlaySessionGuestStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "WAITLISTED"
  | "ON_HOLD"

export interface PlaySessionGuest {
  id: string
  playSessionId: string
  requestedByUserId: string
  requestedByIsHost: boolean
  name: string
  skillLevel?: number | null
  type: PlaySessionGuestType
  status: PlaySessionGuestStatus
  createdAt?: string
  updatedAt?: string
}

export interface RequestGuestInput {
  name: string
  skillLevel?: number
  type?: PlaySessionGuestType
}

export interface ApproveGuestInput {
  status: Extract<
    PlaySessionGuestStatus,
    "CONFIRMED" | "WAITLISTED" | "ON_HOLD"
  >
}

export interface ListPlaySessionGuestsParams {
  status?: "ALL" | PlaySessionGuestStatus
}

export interface ListPlaySessionGuestsResult {
  message?: string
  data: PlaySessionGuest[]
}

export interface UpdateParticipantStatusInput {
  message?: string
  status: "CONFIRMED" | "WAITLISTED" | "ON_HOLD"
}

export interface GroupPlaySession {
  id: string
  title: string
  note?: string | null
  type: "PUBLIC_APP" | "INTERNAL_GROUP" | string
  alowGuests: boolean
  fee: number
  groupId: string | null
  sportCenterId?: string | null
  location?: string | null
  numberOfCourts?: number | null
  courtNames?: string[] | null
  locationNote?: string | null
  paymentQrUrl?: string | null
  paymentCode?: string | null
  paymentNote?: string | null
  maxSlots: number | null
  joinedCount: number
  startTime: string
  endTime: string
  status: string
  creatorId: string
  createdAt: string
  updatedAt: string
  isHost?: boolean
  myParticipationStatus?: "PENDING" | "CONFIRMED" | "none"
}

export interface CreateGroupPlaySessionInput {
  title: string
  description?: string
  startTime: string
  endTime: string
  sportCenterId?: string
  maxSlots?: number
}

export interface UpdateGroupPlaySessionInput {
  title?: string
  description?: string
  sportCenterId?: string | null
  location?: string
  startTime?: string
  endTime?: string
  maxSlots?: number
}

export interface ListMySessionsParams {
  contextType?: "PUBLIC_APP" | "INTERNAL_GROUP" | string
  page?: number
  limit?: number
  search?: string
  status?: string
}

export interface ListMySessionsMeta {
  total: number
  page: number
  limit: number
  totalPages?: number
}

export interface ListMySessionsResult {
  message?: string
  sessions: GroupPlaySession[]
  meta?: ListMySessionsMeta
}

export interface ListPlaySessionsParams {
  contextType?: "PUBLIC_APP" | "INTERNAL_GROUP" | string
  groupId?: string
  status?: "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | string
  search?: string
  startFrom?: string
  startTo?: string
  creatorId?: string
  sortBy?: "createdAt" | "startTime"
  order?: "asc" | "desc"
  page?: number
  limit?: number
  isHost?: boolean
  isParticipant?: boolean
}

export interface PlaySessionsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ListPlaySessionsResult {
  message?: string
  data: GroupPlaySession[]
  meta?: PlaySessionsPagination
}

export interface CountPlaySessionsResult {
  type: string
  groupId?: string
  total: number
}

export interface GetMyScheduleParams {
  timeframe?: "upcoming" | "past"
  page?: number
  limit?: number
}

export interface PublicPlaySessionParticipant {
  id: string
  playSessionId: string
  userId: string
  status: string
  guestsCount?: number
  paymentStatus?: "UNPAID" | "PENDING_REVIEW" | "PAID" | string
  isCheckedIn?: boolean
  joinedAt: string
  name?: string | null
  avatarUrl?: string | null
}

export interface ListPublicParticipantsParams {
  page?: number
  limit?: number
}

export interface ListPublicParticipantsResult {
  data: PublicPlaySessionParticipant[]
  message?: string
}

export interface PlaySessionActionResult {
  message?: string
  data?: {
    playSessionId?: string
    userId?: string
    status?: string
    startedAt?: string
    completedAt?: string
    cancelledAt?: string
    cancelledBy?: string
    id?: string
  }
}

export interface JoinPlaySessionReponse {
  message?: string
  data: {
    id?: string
    playSessionId: string
    userId: string
    status: string
    guestsCount?: number
    paymentStatus?: "UNPAID" | "PENDING_REVIEW" | "PAID"
    isCheckedIn?: boolean
    joinedAt: string
    requestedSlots: number
    totalAmount?: number
  }
}

export interface ApiEnvelope<T> {
  message?: string
  data: T
}

export interface PlaySessionsListEnvelope {
  message?: string
  data: GroupPlaySession[]
  meta?: PlaySessionsPagination
}

export interface CountPlaySessionsEnvelope {
  message?: string
  data: CountPlaySessionsResult
  filter?: Record<string, unknown>
}

export interface MyScheduleEnvelope {
  message?: string
  data: GroupPlaySession[]
  filter?: Record<string, unknown>
}

export interface PublicParticipantsEnvelope {
  message?: string
  data: PublicPlaySessionParticipant[]
}

export interface ListPlaySessionParticipantsParams {
  status?: string
}

export interface ListPlaySessionParticipantsMeta {
  total: number
  page: number
  limit: number
}

export interface ListPlaySessionParticipantsResult {
  message?: string
  data: PlaySessionParticipant[]
}

export interface ParticipantsEnvelope {
  message?: string
  data: PlaySessionParticipant[]
}
