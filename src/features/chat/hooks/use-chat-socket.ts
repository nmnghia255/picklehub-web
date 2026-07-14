"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"

import { useSession } from "@/features/auth/hooks/use-session"

import { chatQueryKeys } from "../api/chat-keys"
import type {
  ChatMessage,
  Conversation,
  ConversationSocketMessageEvent,
  ConversationSocketTypingEvent,
  ConversationSocketUpdatedEvent,
} from "../types"
import {
  replaceMessageInList,
  softDeleteMessageInList,
  updateConversationInListCache,
  upsertConversationDetailCache,
  upsertConversationInListCache,
} from "../utils/chat-cache"

type SocketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"

type ConversationInfiniteData = {
  pages: Array<{ data: Conversation[]; meta?: unknown }>
  pageParams: unknown[]
}

function getSocketBaseUrl() {
  const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""
  return gatewayUrl.replace(/\/$/, "")
}

function resolveConversationId(payload: ConversationSocketUpdatedEvent) {
  return payload.id ?? payload.conversationId ?? null
}

export function useChatSocket(currentUserId: string | null) {
  const session = useSession()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<SocketStatus>("idle")
  const [socketState, setSocketState] = useState<Socket | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const joinedConversationIdRef = useRef<string | null>(null)
  const typingTimersRef = useRef<Record<string, number>>({})

  useEffect(() => {
    if (!session?.accessToken) {
      socketRef.current?.removeAllListeners()
      socketRef.current?.close()
      socketRef.current = null
      queueMicrotask(() => setSocketState(null))
      queueMicrotask(() => setStatus("idle"))
      return
    }

    const baseUrl = getSocketBaseUrl()
    const socket = io(`${baseUrl}/chats`, {
      path: "/chat.io/",
      auth: {
        token: session.accessToken,
      },
      transports: ["websocket"],
      reconnection: true,
    })

    socketRef.current = socket
    queueMicrotask(() => setSocketState(socket))
    queueMicrotask(() => setStatus("connecting"))

    const applyConversationUpdate = (
      conversation: Partial<Conversation> & {
        id?: string
        conversationId?: string
      }
    ) => {
      const conversationId = conversation.id ?? conversation.conversationId
      if (!conversationId) return

      queryClient.setQueryData(
        chatQueryKeys.conversation(conversationId),
        (previous: Conversation | undefined) =>
          previous
            ? upsertConversationDetailCache(previous, {
                ...conversation,
                id: conversationId,
              })
            : previous
      )

      queryClient.setQueryData(
        chatQueryKeys.conversations(),
        (previous: ConversationInfiniteData | undefined) => {
          if (!previous) return previous
          return upsertConversationInListCache(previous, {
            ...conversation,
            id: conversationId,
          } as Conversation)
        }
      )
    }

    const applyMessageChange = (message: ConversationSocketMessageEvent) => {
      if (!message?.conversationId || !message?.id) return

      queryClient.setQueriesData(
        {
          queryKey: [...chatQueryKeys.all, "messages", message.conversationId],
        },
        (previous: unknown) => {
          if (!previous || typeof previous !== "object") return previous
          const typed = previous as {
            pages?: Array<{ data: ChatMessage[]; meta: unknown }>
          }
          if (!typed.pages) return previous
          return {
            ...typed,
            pages: typed.pages.map((page) => ({
              ...page,
              data: replaceMessageInList(page.data, message),
            })),
          }
        }
      )

      queryClient.setQueryData(
        chatQueryKeys.conversation(message.conversationId),
        (previous: Conversation | undefined) => {
          if (!previous) return previous
          return {
            ...previous,
            lastMessage:
              previous.lastMessage?.id === message.id ||
              previous.lastMessage == null
                ? {
                    id: message.id,
                    senderId: message.senderId,
                    type: message.type,
                    body: message.body,
                    mediaUrl: message.mediaUrl,
                    createdAt: message.createdAt,
                  }
                : previous.lastMessage,
            lastMessageAt: message.createdAt,
            updatedAt: message.createdAt,
          }
        }
      )

      queryClient.setQueryData(chatQueryKeys.conversations(), (previous) => {
        const typedPrevious = previous as ConversationInfiniteData | undefined
        return updateConversationInListCache(
          typedPrevious,
          message.conversationId,
          (item) => ({
            ...item,
            lastMessage: {
              id: message.id,
              senderId: message.senderId,
              type: message.type,
              body: message.body,
              mediaUrl: message.mediaUrl,
              createdAt: message.createdAt,
            },
            lastMessageAt: message.createdAt,
            updatedAt: message.createdAt,
          })
        )
      })
    }

    socket.on("connect", () => {
      setStatus("connected")
      if (joinedConversationIdRef.current) {
        socket.emit("join-conversation", {
          conversationId: joinedConversationIdRef.current,
        })
      }
    })

    socket.on("disconnect", () => {
      setStatus("disconnected")
    })

    socket.on("reconnect_attempt", () => {
      setStatus("reconnecting")
    })

    socket.on("reconnect", () => {
      setStatus("connected")
      if (joinedConversationIdRef.current) {
        socket.emit("join-conversation", {
          conversationId: joinedConversationIdRef.current,
        })
      }
    })

    socket.on("message-created", (payload: ConversationSocketMessageEvent) => {
      applyMessageChange(payload)
    })

    socket.on("message-updated", (payload: ConversationSocketMessageEvent) => {
      applyMessageChange(payload)
    })

    socket.on("message-deleted", (payload: ConversationSocketMessageEvent) => {
      if (!payload?.conversationId || !payload?.id) return

      queryClient.setQueryData(
        chatQueryKeys.conversation(payload.conversationId),
        (previous: Conversation | undefined) => {
          if (!previous) return previous
          if (previous.lastMessage?.id !== payload.id) return previous
          return {
            ...previous,
            lastMessage: null,
          }
        }
      )

      queryClient.setQueryData(chatQueryKeys.conversations(), (previous) => {
        const typedPrevious = previous as ConversationInfiniteData | undefined
        return updateConversationInListCache(
          typedPrevious,
          payload.conversationId,
          (item) => ({
            ...item,
            lastMessage:
              item.lastMessage?.id === payload.id ? null : item.lastMessage,
          })
        )
      })

      queryClient.setQueriesData(
        {
          queryKey: [...chatQueryKeys.all, "messages", payload.conversationId],
        },
        (previous: unknown) => {
          if (!previous || typeof previous !== "object") return previous
          const typed = previous as {
            pages?: Array<{ data: ChatMessage[]; meta: unknown }>
          }
          if (!typed.pages) return previous
          return {
            ...typed,
            pages: typed.pages.map((page) => ({
              ...page,
              data: softDeleteMessageInList(page.data, payload.id),
            })),
          }
        }
      )
    })

    socket.on("message-read", (payload: ConversationSocketUpdatedEvent) => {
      const conversationId = resolveConversationId(payload)
      if (!conversationId) return
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversation(conversationId),
      })
    })

    socket.on("typing", (payload: ConversationSocketTypingEvent) => {
      if (!payload.conversationId) return
      if (payload.userId === currentUserId) return

      const timerKey = payload.conversationId
      if (typingTimersRef.current[timerKey]) {
        window.clearTimeout(typingTimersRef.current[timerKey])
      }

      if (payload.isTyping) {
        queryClient.setQueryData(
          ["chat", "typing", payload.conversationId],
          payload
        )

        typingTimersRef.current[timerKey] = window.setTimeout(() => {
          queryClient.removeQueries({
            queryKey: ["chat", "typing", payload.conversationId],
          })
        }, 6000)
      } else {
        queryClient.removeQueries({
          queryKey: ["chat", "typing", payload.conversationId],
        })
      }
    })

    socket.on(
      "conversation-updated",
      (payload: ConversationSocketUpdatedEvent) => {
        applyConversationUpdate({
          ...payload,
          id: resolveConversationId(payload) ?? undefined,
        })
      }
    )

    return () => {
      socket.removeAllListeners()
      socket.close()
      socketRef.current = null
      queueMicrotask(() => setSocketState(null))
      queueMicrotask(() => setStatus("idle"))
      for (const timerId of Object.values(typingTimersRef.current)) {
        window.clearTimeout(timerId)
      }
      typingTimersRef.current = {}
    }
  }, [currentUserId, queryClient, session?.accessToken])

  const joinConversation = useCallback((conversationId: string) => {
    const socket = socketRef.current
    if (!socket || !socket.connected) return

    if (
      joinedConversationIdRef.current &&
      joinedConversationIdRef.current !== conversationId
    ) {
      socket.emit("leave-conversation", {
        conversationId: joinedConversationIdRef.current,
      })
    }

    joinedConversationIdRef.current = conversationId
    socket.emit("join-conversation", { conversationId })
  }, [])

  const leaveConversation = useCallback((conversationId: string) => {
    const socket = socketRef.current
    if (!socket || !socket.connected) return

    socket.emit("leave-conversation", { conversationId })
    if (joinedConversationIdRef.current === conversationId) {
      joinedConversationIdRef.current = null
    }
  }, [])

  const emitTypingStart = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing-start", { conversationId })
  }, [])

  const emitTypingStop = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing-stop", { conversationId })
  }, [])

  const emitMarkRead = useCallback(
    (conversationId: string, messageId: string) => {
      socketRef.current?.emit("mark-read", { conversationId, messageId })
    },
    []
  )

  const emitSendMessage = useCallback(
    (
      conversationId: string,
      payload: {
        type: "TEXT" | "MEDIA" | "SYSTEM"
        body?: string | null
        mediaUrl?: string | null
        metadata?: Record<string, unknown> | null
      }
    ) => {
      socketRef.current?.emit("send-message", {
        conversationId,
        ...payload,
      })
    },
    []
  )

  return {
    socket: socketState,
    status,
    isConnected: status === "connected",
    isReconnecting: status === "reconnecting",
    joinConversation,
    leaveConversation,
    emitTypingStart,
    emitTypingStop,
    emitMarkRead,
    emitSendMessage,
  }
}
