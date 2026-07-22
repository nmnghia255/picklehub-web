import { chatQueryKeys } from "../api/chat-keys"
import type { ChatMessage, Conversation, MessageListResponse } from "../types"

export type ConversationPage = { data: Conversation[]; meta?: unknown }
export type ConversationInfiniteData = {
  pages: ConversationPage[]
  pageParams: unknown[]
}

export function dedupeById<T extends { id: string }>(items: T[]) {
  const map = new Map<string, T>()
  for (const item of items) {
    if (!map.has(item.id)) map.set(item.id, item)
  }
  return [...map.values()]
}

export function getConversationTitle(
  conversation: Conversation,
  currentUserId: string | null = null
) {
  if (conversation.type === "GROUP") {
    return conversation.group?.name ?? ""
  }
  if (conversation.type === "SOCIAL") {
    return conversation.social?.title ?? ""
  }
  if (conversation.type === "TOURNAMENT") {
    return conversation.tournament?.name ?? ""
  }

  const others =
    conversation.participants?.filter(
      (participant) => participant.user && participant.userId !== currentUserId
    ) ?? []

  const fallbackOthers =
    conversation.participants?.filter((participant) => participant.user) ?? []

  return (
    others.find((participant) => participant.user?.name)?.user?.name ??
    fallbackOthers.find((participant) => participant.user?.name)?.user?.name ??
    ""
  )
}

export function getCurrentUserParticipant(
  conversation: Conversation,
  userId: string
) {
  return (
    conversation.participants?.find(
      (participant) => participant.userId === userId
    ) ?? null
  )
}

export function getMutedUntil(conversation: Conversation, userId: string) {
  return getCurrentUserParticipant(conversation, userId)?.mutedUntil ?? null
}

export function isConversationMuted(
  conversation: Conversation,
  userId: string
) {
  const mutedUntil = getMutedUntil(conversation, userId)
  if (!mutedUntil) return false
  const timestamp = Date.parse(mutedUntil)
  return Number.isFinite(timestamp) && timestamp > Date.now()
}

export function getConversationPreview(conversation: Conversation) {
  const lastMessage = conversation.lastMessage
  if (!lastMessage) return ""

  if (lastMessage.type === "SYSTEM") return lastMessage.body ?? ""
  return lastMessage.body ?? ""
}

export function softDeleteMessageInList(
  messages: ChatMessage[],
  messageId: string,
  deletedAt = new Date().toISOString()
) {
  return messages.map((message) =>
    message.id === messageId
      ? {
          ...message,
          body: null,
          mediaUrl: null,
          metadata: null,
          deletedAt,
        }
      : message
  )
}

export function mergeConversationIntoList(
  conversations: Conversation[] | undefined,
  nextConversation: Conversation
) {
  const current = conversations ?? []
  const next = current.filter(
    (conversation) => conversation.id !== nextConversation.id
  )
  return [nextConversation, ...next]
}

export function upsertConversationInListCache(
  previous: ConversationInfiniteData | undefined,
  nextConversation: Conversation
) {
  if (!previous) return previous

  const currentConversation =
    previous.pages
      .flatMap((page) => page.data)
      .find((conversation) => conversation.id === nextConversation.id) ?? null

  const mergedConversation: Conversation = currentConversation
    ? {
        ...currentConversation,
        ...nextConversation,
        participants:
          nextConversation.participants ??
          currentConversation.participants ??
          [],
        group:
          nextConversation.group === undefined
            ? currentConversation.group
            : nextConversation.group,
        social:
          nextConversation.social === undefined
            ? currentConversation.social
            : nextConversation.social,
        tournament:
          nextConversation.tournament === undefined
            ? currentConversation.tournament
            : nextConversation.tournament,
        lastMessage:
          nextConversation.lastMessage === undefined
            ? currentConversation.lastMessage
            : nextConversation.lastMessage,
      }
    : nextConversation

  return {
    ...previous,
    pages: previous.pages.map((page, index) => {
      const filtered = page.data.filter(
        (conversation) => conversation.id !== nextConversation.id
      )

      return index === 0
        ? {
            ...page,
            data: [mergedConversation, ...filtered],
          }
        : {
            ...page,
            data: filtered,
          }
    }),
  }
}

export function removeConversationFromListCache(
  previous: ConversationInfiniteData | undefined,
  conversationId: string
) {
  if (!previous) return previous

  return {
    ...previous,
    pages: previous.pages.map((page) => ({
      ...page,
      data: page.data.filter(
        (conversation) => conversation.id !== conversationId
      ),
    })),
  }
}

export function updateConversationInListCache(
  previous: ConversationInfiniteData | undefined,
  conversationId: string,
  updater: (conversation: Conversation) => Conversation
) {
  if (!previous) return previous

  return {
    ...previous,
    pages: previous.pages.map((page) => ({
      ...page,
      data: page.data.map((conversation) =>
        conversation.id === conversationId
          ? updater(conversation)
          : conversation
      ),
    })),
  }
}

export function upsertConversationDetailCache(
  previous: Conversation | undefined,
  nextConversation: Partial<Conversation> & { id: string }
) {
  if (!previous) return previous
  return {
    ...previous,
    ...nextConversation,
    participants: nextConversation.participants ?? previous.participants ?? [],
    group:
      nextConversation.group === undefined
        ? previous.group
        : nextConversation.group,
    social:
      nextConversation.social === undefined
        ? previous.social
        : nextConversation.social,
    tournament:
      nextConversation.tournament === undefined
        ? previous.tournament
        : nextConversation.tournament,
    lastMessage:
      nextConversation.lastMessage === undefined
        ? previous.lastMessage
        : nextConversation.lastMessage,
  }
}

export function mergeMessagesById(messages: ChatMessage[]) {
  return dedupeById(messages).sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
  )
}

export function prependMessagesPage(
  current: MessageListResponse | undefined,
  incoming: MessageListResponse
) {
  if (!current) return incoming

  return {
    ...incoming,
    data: mergeMessagesById([...incoming.data, ...current.data]),
  }
}

export function replaceMessageInList(
  messages: ChatMessage[],
  nextMessage: ChatMessage
) {
  const filtered = messages.filter((message) => message.id !== nextMessage.id)
  return [...filtered, nextMessage]
}

export function removeMessageFromList(
  messages: ChatMessage[],
  messageId: string
) {
  return messages.filter((message) => message.id !== messageId)
}

export function updateMessageInList(
  messages: ChatMessage[],
  nextMessage: ChatMessage
) {
  return messages.map((message) =>
    message.id === nextMessage.id ? nextMessage : message
  )
}

export function getMessageQueryKey(
  conversationId: string,
  search: string | null
) {
  return chatQueryKeys.messages(conversationId, search)
}
