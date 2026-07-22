export type ConversationType = "DIRECT" | "GROUP" | "SOCIAL" | "TOURNAMENT"

export type MessageType = "TEXT" | "MEDIA" | "SYSTEM"

export interface ConversationUser {
  id: string
  name: string
  email: string
  role: string
}

export interface ConversationParticipant {
  userId: string
  role: string
  mutedUntil: string | null
  user: ConversationUser | null
}

export interface GroupSummary {
  id: string
  name: string
  maxMembers: number | null
  memberCount: number
}

export interface SocialSummary {
  id: string
  title: string
  status: string
  creatorId: string
  joinedCount: number
}

export interface TournamentSummary {
  id: string
  name: string
  status: string
  organizerId: string
  registered: number
  capacity: number
}

export interface LastMessage {
  id: string
  senderId: string
  type: MessageType
  body: string | null
  mediaUrl: string | null
  createdAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  sender: ConversationUser | null
  type: MessageType
  body: string | null
  mediaUrl: string | null
  metadata: Record<string, unknown> | null
  editedAt: string | null
  deletedAt: string | null
  createdAt: string
}

export interface Conversation {
  id: string
  type: ConversationType
  groupId: string | null
  socialId: string | null
  tournamentId: string | null
  group: GroupSummary | null
  social: SocialSummary | null
  tournament: TournamentSummary | null
  participants: ConversationParticipant[]
  lastMessage: LastMessage | null
  unreadCount: number
  lastMessageAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ConversationListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ConversationListResponse {
  data: Conversation[]
  meta: ConversationListMeta
}

export interface MessageCursorMeta {
  limit: number
  nextBefore: string | null
}

export interface MessageListResponse {
  data: ChatMessage[]
  meta: MessageCursorMeta
}

export interface OpenDirectConversationInput {
  userId: string
}

export interface OpenGroupConversationInput {
  groupId: string
}

export interface OpenSocialConversationInput {
  socialId: string
}

export interface OpenTournamentConversationInput {
  tournamentId: string
}

export interface MarkReadInput {
  messageId: string
}

export interface MarkReadResponse {
  conversationId: string
  userId: string
  lastReadMessageId: string
  lastReadAt: string
}

export interface MuteConversationInput {
  mutedUntil: string | null
}

export interface MuteConversationResponse {
  conversationId: string
  userId: string
  mutedUntil: string | null
}

export interface SendMessageInput {
  type: MessageType
  body?: string | null
  mediaUrl?: string | null
  metadata?: Record<string, unknown> | null
}

export interface EditMessageInput {
  body: string
  metadata?: Record<string, unknown> | null
}

export interface ChatApiErrorBody {
  message?: string | string[]
  error?: string
  errorCode?: string
  statusCode?: number
}

export interface ChatApiError extends Error {
  status?: number
  body?: ChatApiErrorBody | unknown
}

export type ConversationSocketMessageEvent = ChatMessage

export interface ConversationSocketTypingEvent {
  conversationId: string
  userId: string
  isTyping: boolean
}

export interface ConversationSocketUpdatedEvent {
  id?: string
  conversationId?: string
  unreadCount?: number
  lastMessage?: LastMessage | null
  lastMessageAt?: string | null
  updatedAt?: string
  participants?: ConversationParticipant[]
  group?: GroupSummary | null
  social?: SocialSummary | null
  tournament?: TournamentSummary | null
}
