import type {
  ChatApiError,
  ChatApiErrorBody,
  ChatMessage,
  Conversation,
  ConversationListResponse,
  EditMessageInput,
  MarkReadInput,
  MarkReadResponse,
  MessageListResponse,
  MuteConversationInput,
  MuteConversationResponse,
  OpenDirectConversationInput,
  OpenGroupConversationInput,
  OpenSocialConversationInput,
  OpenTournamentConversationInput,
  SendMessageInput,
} from "../types"

const CHAT_PROXY_BASE = "/api/proxy/chats"

type QueryParams = Record<string, string | number | boolean | null | undefined>

function toSearchParams(params?: QueryParams) {
  const searchParams = new URLSearchParams()
  if (!params) return searchParams
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    searchParams.set(key, String(value))
  }
  return searchParams
}

function unwrapChatPayload<T>(payload: unknown): T {
  if (payload && typeof payload === "object") {
    const maybePayload = payload as Record<string, unknown>
    if ("data" in maybePayload && "meta" in maybePayload) {
      return payload as T
    }
    if ("data" in maybePayload && Object.keys(maybePayload).length === 1) {
      return maybePayload.data as T
    }
  }
  return payload as T
}

function makeChatApiError(
  status: number,
  body: ChatApiErrorBody | unknown,
  fallbackMessage: string
): ChatApiError {
  const error = new Error(fallbackMessage) as ChatApiError
  error.status = status
  error.body = body
  return error
}

async function chatFetch<T>(
  path: string,
  init: RequestInit = {},
  params?: QueryParams
): Promise<T> {
  const search = params ? `?${toSearchParams(params).toString()}` : ""
  const response = await fetch(`${CHAT_PROXY_BASE}${path}${search}`, {
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  })

  const bodyText = await response.text()
  let payload: unknown = null
  if (bodyText) {
    try {
      payload = JSON.parse(bodyText) as unknown
    } catch {
      payload = bodyText
    }
  }

  if (!response.ok) {
    const message = (() => {
      if (!payload || typeof payload !== "object") {
        return `Request failed with status ${response.status}`
      }
      const maybePayload = payload as ChatApiErrorBody
      if (Array.isArray(maybePayload.message)) {
        return maybePayload.message.join(", ")
      }
      if (typeof maybePayload.message === "string") {
        return maybePayload.message
      }
      if (typeof maybePayload.error === "string") {
        return maybePayload.error
      }
      return `Request failed with status ${response.status}`
    })()

    throw makeChatApiError(response.status, payload ?? null, message)
  }

  if (!payload) {
    return undefined as T
  }

  return unwrapChatPayload<T>(payload)
}

export const chatClient = {
  listConversations: (params?: { page?: number; limit?: number }) =>
    chatFetch<ConversationListResponse>(
      "/conversations",
      { method: "GET" },
      params
    ),

  createDirectConversation: (input: OpenDirectConversationInput) =>
    chatFetch<Conversation>("/conversations/direct", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  createGroupConversation: (input: OpenGroupConversationInput) =>
    chatFetch<Conversation>("/conversations/group", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  createSocialConversation: (input: OpenSocialConversationInput) =>
    chatFetch<Conversation>("/conversations/social", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  createTournamentConversation: (input: OpenTournamentConversationInput) =>
    chatFetch<Conversation>("/conversations/tournament", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  getConversation: (conversationId: string) =>
    chatFetch<Conversation>(`/conversations/${conversationId}`, {
      method: "GET",
    }),

  hideConversation: (conversationId: string) =>
    chatFetch<{ message: string }>(`/conversations/${conversationId}`, {
      method: "DELETE",
    }),

  markConversationRead: (conversationId: string, input: MarkReadInput) =>
    chatFetch<MarkReadResponse>(`/conversations/${conversationId}/read`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  muteConversation: (conversationId: string, input: MuteConversationInput) =>
    chatFetch<MuteConversationResponse>(
      `/conversations/${conversationId}/mute`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    ),

  listMessages: (
    conversationId: string,
    params?: { before?: string; limit?: number; search?: string }
  ) =>
    chatFetch<MessageListResponse>(
      `/conversations/${conversationId}/messages`,
      { method: "GET" },
      params
    ),

  sendMessage: (conversationId: string, input: SendMessageInput) =>
    chatFetch<ChatMessage>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  editMessage: (
    conversationId: string,
    messageId: string,
    input: EditMessageInput
  ) =>
    chatFetch<ChatMessage>(
      `/conversations/${conversationId}/messages/${messageId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    ),

  deleteMessage: (conversationId: string, messageId: string) =>
    chatFetch<{ message: string }>(
      `/conversations/${conversationId}/messages/${messageId}`,
      {
        method: "DELETE",
      }
    ),
}
