export type Participant = {
  id: string
  playSessionId: string
  userId: string
  status: "JOINED" | "LEFT" | "KICKED"
  joinedAt: string
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
  userId: string
  joinedAt?: string
  displayName?: string
  status?: string
  isHost?: boolean
}

export interface GroupPlaySession {
  id: string
  title: string
  description?: string | null
  type: "PUBLIC_APP" | "INTERNAL_GROUP" | string
  groupId: string | null
  courtBookingId?: string | null
  maxSlots?: number | null
  joinedCount?: number
  startTime: string
  endTime: string
  status: string
  creatorId: string
  participants?: PlaySessionParticipant[]
  createdAt: string
  updatedAt: string
}

export interface CreateGroupPlaySessionInput {
  title: string
  description?: string
  startTime: string
  endTime: string
  courtBookingId?: string
  maxSlots?: number
}

export interface UpdateGroupPlaySessionInput {
  title?: string
  description?: string
  courtBookingId?: string | null
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
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | string
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
  contextType?: "PUBLIC_APP" | "INTERNAL_GROUP" | string
  groupId?: string
  period?: "week" | "month"
}

export interface PublicPlaySessionParticipant {
  userId: string
  joinedAt: string
}

export interface ListPublicParticipantsParams {
  page?: number
  limit?: number
}

export interface ListPublicParticipantsResult {
  participants: PublicPlaySessionParticipant[]
  pagination?: PlaySessionsPagination
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
  pagination?: PlaySessionsPagination
}

export interface ListPlaySessionParticipantsParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export interface ListPlaySessionParticipantsMeta {
  total: number
  page: number
  limit: number
}

export interface ListPlaySessionParticipantsResult {
  participants: PlaySessionParticipant[]
  meta?: ListPlaySessionParticipantsMeta
}

export interface ParticipantsEnvelope {
  participants: PlaySessionParticipant[]
  meta?: ListPlaySessionParticipantsMeta
}
