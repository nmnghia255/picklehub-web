export type ConversationType = "group" | "personal" | "social"

export interface ChatUser {
  id: string
  name: string
  avatarUrl: string | null
}

export interface SourceInfo {
  type: "group" | "social"
  name: string
}

export interface Conversation {
  id: string
  name: string
  avatarUrl: string | null
  type: ConversationType
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  participants: ChatUser[]
  sourceInfo: SourceInfo | null
  updatedAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  authorId: string
  authorName: string
  authorAvatar: string | null
  kind: "text" | "image"
  text: string
  imageUrl: string | null
  createdAt: string
}
