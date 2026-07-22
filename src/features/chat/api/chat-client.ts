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
export const DEFAULT_CONVERSATION_PAGE_SIZE = 10
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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

  createGroupConversation: async (input: OpenGroupConversationInput) => {
    try {
      return await chatFetch<Conversation>("/conversations/group", {
        method: "POST",
        body: JSON.stringify(input),
      })
    } catch (err: unknown) {
      const error = err as ChatApiError
      if (error.status === 404) {
        try {
          return await chatFetch<Conversation>("/conversations/groups", {
            method: "POST",
            body: JSON.stringify(input),
          })
        } catch {
          try {
            const list = await chatClient.listConversations({
              limit: DEFAULT_CONVERSATION_PAGE_SIZE,
            })
            const existing = list.data?.find(
              (c) =>
                c.groupId === input.groupId || c.group?.id === input.groupId
            )
            if (existing) return existing
          } catch {
            // ignore
          }
        }
      }
      throw err
    }
  },

  createSocialConversation: (input: OpenSocialConversationInput) =>
    chatFetch<Conversation>("/conversations/social", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  createTournamentConversation: async (
    input: OpenTournamentConversationInput
  ) => {
    if (!UUID_PATTERN.test(input.tournamentId)) {
      throw makeChatApiError(
        400,
        { errorCode: "INVALID_TOURNAMENT_ID" },
        "Invalid tournament ID"
      )
    }

    try {
      return await chatFetch<Conversation>("/conversations/tournament", {
        method: "POST",
        body: JSON.stringify(input),
      })
    } catch (err: unknown) {
      const error = err as ChatApiError
      if (error.status === 404) {
        try {
          return await chatFetch<Conversation>("/conversations/tournaments", {
            method: "POST",
            body: JSON.stringify(input),
          })
        } catch {
          try {
            const list = await chatClient.listConversations({
              limit: DEFAULT_CONVERSATION_PAGE_SIZE,
            })
            const existing = list.data?.find(
              (c) =>
                c.tournamentId === input.tournamentId ||
                c.tournament?.id === input.tournamentId
            )
            if (existing) return existing
          } catch {
            // ignore
          }
        }
      }
      throw err
    }
  },

  getConversation: async (conversationId: string) => {
    try {
      return await chatFetch<Conversation>(`/conversations/${conversationId}`, {
        method: "GET",
      })
    } catch (err: unknown) {
      const error = err as ChatApiError
      if (error.status === 404) {
        try {
          const list = await chatClient.listConversations({
            limit: DEFAULT_CONVERSATION_PAGE_SIZE,
          })
          const existing = list.data?.find((c) => c.id === conversationId)
          if (existing) return existing
        } catch {
          // ignore
        }
      }
      throw err
    }
  },

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
