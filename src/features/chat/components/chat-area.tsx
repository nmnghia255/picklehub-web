"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  BellOff,
  BellRing,
  Loader2,
  MessageSquare,
  Search,
  Trash2,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { MediaService } from "@/features/sport-center/api/media-service"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

import { chatClient } from "../api/chat-client"
import { chatQueryKeys } from "../api/chat-keys"
import { useChatSocket } from "../hooks/use-chat-socket"
import { useMessages } from "../hooks/use-messages"
import type { ChatMessage, Conversation } from "../types"
import {
  dedupeById,
  getConversationTitle,
  isConversationMuted,
  mergeMessagesById,
  removeConversationFromListCache,
  replaceMessageInList,
  softDeleteMessageInList,
  updateConversationInListCache,
  updateMessageInList,
} from "../utils/chat-cache"
import { formatChatTime, formatRelativeChatTime } from "../utils/chat-date"
import { MessageBubble } from "./message-bubble"
import { MessageComposer } from "./message-composer"

type DraftMessage = ChatMessage & {
  type: "TEXT" | "MEDIA"
  clientRequestId: string
  clientStatus: "sending" | "failed"
}

type ConversationInfiniteData = {
  pages: Array<{ data: Conversation[]; meta?: unknown }>
  pageParams: unknown[]
}

interface ChatAreaProps {
  conversationId: string
  currentUserId: string | null
  onBack?: () => void
  onConversationHidden?: () => void
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
}

function getConversationTypeLabel(
  conversation: Conversation,
  t: (key: string) => string
) {
  switch (conversation.type) {
    case "GROUP":
      return t("chat.conversationTypes.group")
    case "SOCIAL":
      return t("chat.conversationTypes.social")
    case "TOURNAMENT":
      return t("chat.conversationTypes.tournament")
    default:
      return t("chat.conversationTypes.direct")
  }
}

function getConversationMetadataLabel(
  conversation: Conversation,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  if (conversation.type === "GROUP") {
    return conversation.group?.memberCount != null
      ? t("chat.meta.groupMembers", { count: conversation.group.memberCount })
      : t("chat.meta.group")
  }

  if (conversation.type === "SOCIAL") {
    return conversation.social?.joinedCount != null
      ? t("chat.meta.socialParticipants", {
          count: conversation.social.joinedCount,
        })
      : t("chat.meta.social")
  }

  if (conversation.type === "TOURNAMENT") {
    return conversation.tournament?.registered != null
      ? t("chat.meta.tournamentParticipants", {
          count: conversation.tournament.registered,
        })
      : t("chat.meta.tournament")
  }

  return t("chat.meta.direct")
}

function getParticipantName(conversation: Conversation, userId: string) {
  return (
    conversation.participants?.find(
      (participant) => participant.userId === userId
    )?.user?.name ?? ""
  )
}

function buildNormalizedMessages(
  serverMessages: ChatMessage[],
  drafts: DraftMessage[]
) {
  const draftRequestIds = new Set(
    drafts.map((draft) => draft.clientRequestId).filter(Boolean)
  )
  const serverRequestIds = new Set(
    serverMessages
      .map((message) => message.metadata?.clientRequestId)
      .filter((value): value is string => typeof value === "string")
  )

  const visibleDrafts = drafts.filter(
    (draft) =>
      !serverRequestIds.has(draft.clientRequestId) &&
      !serverMessages.some((message) => message.id === draft.id)
  )

  const normalizedServer = serverMessages.filter((message) => {
    const requestId = message.metadata?.clientRequestId
    if (typeof requestId === "string" && draftRequestIds.has(requestId)) {
      return true
    }
    return true
  })

  return mergeMessagesById(
    [...normalizedServer, ...visibleDrafts].map((message) => ({
      ...message,
      createdAt: message.createdAt,
    }))
  )
}

function getChatApiErrorMessage(
  error: unknown,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  if (!error || typeof error !== "object") {
    return t("chat.errors.generic")
  }

  const chatError = error as {
    status?: number
    body?: { message?: string | string[]; error?: string }
    message?: string
  }

  const body = chatError.body
  if (body?.message) {
    if (Array.isArray(body.message)) {
      return body.message.join(", ")
    }
    if (typeof body.message === "string") {
      return body.message
    }
  }

  switch (chatError.status) {
    case 400:
      return t("chat.errors.invalidRequest")
    case 401:
      return t("chat.errors.unauthorized")
    case 403:
      return t("chat.errors.forbidden")
    case 404:
      return t("chat.errors.notFound")
    default:
      return chatError.message || t("chat.errors.generic")
  }
}

export function ChatArea({
  conversationId,
  currentUserId,
  onBack,
  onConversationHidden,
}: ChatAreaProps) {
  const { t, i18n } = useTranslation("common")
  const locale = i18n.resolvedLanguage?.startsWith("vi") ? "vi" : "en"
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()
  const [messageSearchInput, setMessageSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [composerValue, setComposerValue] = useState("")
  const [draftMessages, setDraftMessages] = useState<DraftMessage[]>([])
  const [editTarget, setEditTarget] = useState<ChatMessage | null>(null)
  const [editValue, setEditValue] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<ChatMessage | null>(null)
  const [hideOpen, setHideOpen] = useState(false)
  const [muteOpen, setMuteOpen] = useState(false)
  const [hidePending, setHidePending] = useState(false)
  const [muting, setMuting] = useState(false)
  const [sending, setSending] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const pendingScrollAdjustmentRef = useRef<{
    scrollHeight: number
    scrollTop: number
  } | null>(null)
  const lastMarkedReadRef = useRef<Record<string, string | null>>({})
  const pendingSendRequestsRef = useRef<Set<string>>(new Set())

  const conversationQuery = useQuery({
    queryKey: chatQueryKeys.conversation(conversationId),
    queryFn: () => chatClient.getConversation(conversationId),
    enabled: Boolean(conversationId),
  })

  const messagesQuery = useMessages(conversationId, debouncedSearch, 30)
  const typingQuery = useQuery({
    queryKey: ["chat", "typing", conversationId],
    queryFn: async () => null,
    enabled: false,
    staleTime: Infinity,
  })

  const {
    isConnected,
    isReconnecting,
    joinConversation,
    leaveConversation,
    emitMarkRead,
  } = useChatSocket(currentUserId)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(messageSearchInput.trim())
    }, 350)
    return () => window.clearTimeout(timer)
  }, [messageSearchInput])

  useEffect(() => {
    if (!conversationId || !isConnected) return
    joinConversation(conversationId)
    return () => {
      leaveConversation(conversationId)
    }
  }, [conversationId, isConnected, joinConversation, leaveConversation])

  const conversation = conversationQuery.data ?? null

  const serverMessages = useMemo(() => {
    const pages = messagesQuery.data?.pages ?? []
    const merged = pages.flatMap((page) => page.data ?? [])
    return dedupeById(merged).sort(
      (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
    )
  }, [messagesQuery.data?.pages])

  const serverRequestIds = useMemo(
    () =>
      new Set(
        serverMessages
          .map((message) => message.metadata?.clientRequestId)
          .filter((value): value is string => typeof value === "string")
      ),
    [serverMessages]
  )

  const visibleDraftMessages = useMemo(
    () =>
      draftMessages.filter(
        (draft) => !serverRequestIds.has(draft.clientRequestId)
      ),
    [draftMessages, serverRequestIds]
  )

  const mergedMessages = useMemo(
    () => buildNormalizedMessages(serverMessages, visibleDraftMessages),
    [serverMessages, visibleDraftMessages]
  )

  const latestMessage = mergedMessages.at(-1) ?? null
  const typingPayload = typingQuery.data as
    | { conversationId: string; userId: string; isTyping: boolean }
    | null
    | undefined
  const typingUserName =
    conversation?.participants?.find(
      (participant) => participant.userId === typingPayload?.userId
    )?.user?.name ?? t("chat.labels.someone")

  useEffect(() => {
    const latestId = latestMessage?.id ?? null
    if (!conversationId || !latestId || !currentUserId) return

    if (lastMarkedReadRef.current[conversationId] === latestId) return

    const timerId = window.setTimeout(async () => {
      if (lastMarkedReadRef.current[conversationId] === latestId) return

      try {
        if (isConnected) {
          emitMarkRead(conversationId, latestId)
        } else {
          await chatClient.markConversationRead(conversationId, {
            messageId: latestId,
          })
        }

        lastMarkedReadRef.current[conversationId] = latestId
        queryClient.setQueryData(
          chatQueryKeys.conversation(conversationId),
          (previous: Conversation | undefined) =>
            previous
              ? {
                  ...previous,
                  unreadCount: 0,
                }
              : previous
        )
        queryClient.setQueryData(chatQueryKeys.conversations(), (previous) => {
          const typedPrevious = previous as ConversationInfiniteData | undefined
          return updateConversationInListCache(
            typedPrevious,
            conversationId,
            (item) => ({
              ...item,
              unreadCount: 0,
            })
          )
        })
      } catch (error) {
        console.warn("Failed to mark chat conversation as read:", error)
      }
    }, 700)

    return () => window.clearTimeout(timerId)
  }, [
    conversationId,
    currentUserId,
    emitMarkRead,
    isConnected,
    latestMessage?.id,
    queryClient,
  ])

  useEffect(() => {
    const container = scrollAreaRef.current
    if (!container) return

    if (pendingScrollAdjustmentRef.current) {
      const previous = pendingScrollAdjustmentRef.current
      const nextScrollTop =
        container.scrollHeight - previous.scrollHeight + previous.scrollTop
      container.scrollTop = nextScrollTop
      pendingScrollAdjustmentRef.current = null
      return
    }

    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      200

    if (nearBottom) {
      container.scrollTop = container.scrollHeight
    }
  }, [mergedMessages.length, conversationId, latestMessage?.id])

  const handleLoadOlderMessages = () => {
    if (!messagesQuery.hasNextPage || messagesQuery.isFetchingNextPage) return

    const container = scrollAreaRef.current
    if (container) {
      pendingScrollAdjustmentRef.current = {
        scrollHeight: container.scrollHeight,
        scrollTop: container.scrollTop,
      }
    }

    void messagesQuery.fetchNextPage()
  }

  const handleScroll = () => {
    const container = scrollAreaRef.current
    if (!container) return

    if (
      container.scrollTop <= 100 &&
      messagesQuery.hasNextPage &&
      !messagesQuery.isFetchingNextPage
    ) {
      handleLoadOlderMessages()
    }
  }

  const updateMessageCache = (nextMessage: ChatMessage) => {
    queryClient.setQueryData(
      chatQueryKeys.conversation(conversationId),
      (previous: Conversation | undefined) =>
        previous
          ? {
              ...previous,
              lastMessage: {
                id: nextMessage.id,
                senderId: nextMessage.senderId,
                type: nextMessage.type,
                body: nextMessage.body,
                mediaUrl: nextMessage.mediaUrl,
                createdAt: nextMessage.createdAt,
              },
              lastMessageAt: nextMessage.createdAt,
              updatedAt: nextMessage.createdAt,
              unreadCount:
                currentUserId && nextMessage.senderId === currentUserId
                  ? previous.unreadCount
                  : previous.unreadCount + 1,
            }
          : previous
    )

    queryClient.setQueryData(chatQueryKeys.conversations(), (previous) => {
      const typedPrevious = previous as ConversationInfiniteData | undefined
      return updateConversationInListCache(
        typedPrevious,
        conversationId,
        (item) => ({
          ...item,
          lastMessage: {
            id: nextMessage.id,
            senderId: nextMessage.senderId,
            type: nextMessage.type,
            body: nextMessage.body,
            mediaUrl: nextMessage.mediaUrl,
            createdAt: nextMessage.createdAt,
          },
          lastMessageAt: nextMessage.createdAt,
          updatedAt: nextMessage.createdAt,
          unreadCount:
            currentUserId && nextMessage.senderId === currentUserId
              ? item.unreadCount
              : item.unreadCount + 1,
        })
      )
    })

    queryClient.setQueriesData(
      { queryKey: [...chatQueryKeys.all, "messages", conversationId] },
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
            data: replaceMessageInList(page.data, nextMessage),
          })),
        }
      }
    )
  }

  const markOptimisticResolved = (clientRequestId: string) => {
    setDraftMessages((current) =>
      current.filter((draft) => draft.clientRequestId !== clientRequestId)
    )
  }

  const addOptimisticDraft = (draft: DraftMessage) => {
    setDraftMessages((current) => [...current, draft])
  }

  const sendMessage = async (
    payload: {
      type: "TEXT" | "MEDIA"
      body?: string | null
      mediaUrl?: string | null
      metadata?: Record<string, unknown> | null
    },
    draftText?: string,
    options?: { clientRequestId?: string }
  ) => {
    if (!currentUserId) return

    const clientRequestId = options?.clientRequestId ?? crypto.randomUUID()
    if (pendingSendRequestsRef.current.has(clientRequestId)) {
      return
    }

    pendingSendRequestsRef.current.add(clientRequestId)
    setDraftMessages((current) =>
      current.filter((draft) => draft.clientRequestId !== clientRequestId)
    )
    const optimistic: DraftMessage = {
      id: `draft-${clientRequestId}`,
      conversationId,
      senderId: currentUserId,
      sender:
        conversation?.participants?.find(
          (participant) => participant.userId === currentUserId
        )?.user ?? null,
      type: payload.type,
      body: payload.body ?? null,
      mediaUrl: payload.mediaUrl ?? null,
      metadata: {
        ...(payload.metadata ?? {}),
        clientRequestId,
      },
      editedAt: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      clientRequestId,
      clientStatus: "sending",
    }

    addOptimisticDraft(optimistic)

    try {
      const message = await chatClient.sendMessage(conversationId, {
        ...payload,
        metadata: {
          ...(payload.metadata ?? {}),
          clientRequestId,
        },
      })

      markOptimisticResolved(clientRequestId)
      updateMessageCache(message)
      setComposerValue("")
    } catch (error) {
      setDraftMessages((current) =>
        current.map((item) =>
          item.clientRequestId === clientRequestId
            ? { ...item, clientStatus: "failed" }
            : item
        )
      )
      toast.error(getChatApiErrorMessage(error, t))
      if (draftText !== undefined) {
        setComposerValue(draftText)
      }
    } finally {
      pendingSendRequestsRef.current.delete(clientRequestId)
    }
  }

  const handleSendText = async () => {
    const trimmed = composerValue.trim()
    if (!trimmed || trimmed.length > 4000) return
    const previousText = composerValue
    setComposerValue("")
    setSending(true)
    try {
      await sendMessage(
        { type: "TEXT", body: trimmed, mediaUrl: null },
        previousText
      )
    } finally {
      setSending(false)
    }
  }

  const handleUploadMedia = async (file: File) => {
    if (!currentUserId) return
    const caption = composerValue.trim()
    setSending(true)
    try {
      const mediaUrl = await MediaService.uploadImage(file)
      setComposerValue("")
      await sendMessage(
        {
          type: "MEDIA",
          body: caption || null,
          mediaUrl,
          metadata: {
            width: null,
            height: null,
          },
        },
        caption
      )
    } catch (error) {
      toast.error(getChatApiErrorMessage(error, t))
    } finally {
      setSending(false)
    }
  }

  const handleRetryMessage = async (draft: DraftMessage) => {
    setDraftMessages((current) =>
      current.map((item) =>
        item.clientRequestId === draft.clientRequestId
          ? { ...item, clientStatus: "sending" }
          : item
      )
    )
    await sendMessage(
      {
        type: draft.type,
        body: draft.body,
        mediaUrl: draft.mediaUrl,
        metadata: draft.metadata,
      },
      draft.body ?? "",
      { clientRequestId: draft.clientRequestId }
    )
  }

  const handleEditMessage = async () => {
    if (!editTarget) return
    const trimmed = editValue.trim()
    if (!trimmed || trimmed.length > 4000) return

    try {
      const nextMessage = await chatClient.editMessage(
        conversationId,
        editTarget.id,
        {
          body: trimmed,
          metadata: editTarget.metadata,
        }
      )

      queryClient.setQueryData(
        chatQueryKeys.conversation(conversationId),
        (previous: Conversation | undefined) =>
          previous
            ? {
                ...previous,
                lastMessage:
                  previous.lastMessage?.id === nextMessage.id
                    ? {
                        id: nextMessage.id,
                        senderId: nextMessage.senderId,
                        type: nextMessage.type,
                        body: nextMessage.body,
                        mediaUrl: nextMessage.mediaUrl,
                        createdAt: nextMessage.createdAt,
                      }
                    : previous.lastMessage,
                lastMessageAt: nextMessage.createdAt,
                updatedAt: nextMessage.editedAt ?? nextMessage.createdAt,
              }
            : previous
      )

      queryClient.setQueriesData(
        { queryKey: [...chatQueryKeys.all, "messages", conversationId] },
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
              data: updateMessageInList(page.data, nextMessage),
            })),
          }
        }
      )
      toast.success(t("chat.toasts.messageUpdated"))
      setEditTarget(null)
    } catch (error) {
      toast.error(getChatApiErrorMessage(error, t))
    }
  }

  const handleDeleteMessage = async () => {
    if (!deleteTarget) return

    try {
      await chatClient.deleteMessage(conversationId, deleteTarget.id)
      queryClient.setQueriesData(
        { queryKey: [...chatQueryKeys.all, "messages", conversationId] },
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
              data: softDeleteMessageInList(page.data, deleteTarget.id),
            })),
          }
        }
      )
      queryClient.setQueryData(
        chatQueryKeys.conversation(conversationId),
        (previous: Conversation | undefined) =>
          previous
            ? {
                ...previous,
                lastMessage:
                  previous.lastMessage?.id === deleteTarget.id
                    ? null
                    : previous.lastMessage,
              }
            : previous
      )
      queryClient.setQueryData(chatQueryKeys.conversations(), (previous) => {
        const typedPrevious = previous as ConversationInfiniteData | undefined
        return updateConversationInListCache(
          typedPrevious,
          conversationId,
          (item) => ({
            ...item,
            lastMessage:
              item.lastMessage?.id === deleteTarget.id
                ? null
                : item.lastMessage,
          })
        )
      })
      toast.success(t("chat.toasts.messageDeleted"))
      setDeleteTarget(null)
    } catch (error) {
      toast.error(getChatApiErrorMessage(error, t))
    }
  }

  const handleMuteConversation = async (mutedUntil: string | null) => {
    try {
      setMuting(true)
      const response = await chatClient.muteConversation(conversationId, {
        mutedUntil,
      })

      queryClient.setQueryData(
        chatQueryKeys.conversation(conversationId),
        (previous: Conversation | undefined) =>
          previous
            ? {
                ...previous,
                participants: previous.participants.map((participant) =>
                  participant.userId === currentUserId
                    ? { ...participant, mutedUntil: response.mutedUntil }
                    : participant
                ),
              }
            : previous
      )
      queryClient.setQueryData(chatQueryKeys.conversations(), (previous) => {
        const typedPrevious = previous as ConversationInfiniteData | undefined
        return updateConversationInListCache(
          typedPrevious,
          conversationId,
          (item) => ({
            ...item,
            participants: item.participants.map((participant) =>
              participant.userId === currentUserId
                ? { ...participant, mutedUntil: response.mutedUntil }
                : participant
            ),
          })
        )
      })
      toast.success(
        response.mutedUntil ? t("chat.toasts.muted") : t("chat.toasts.unmuted")
      )
    } catch (error) {
      toast.error(getChatApiErrorMessage(error, t))
    } finally {
      setMuting(false)
    }
  }

  const handleHideConversation = async () => {
    try {
      setHidePending(true)
      await chatClient.hideConversation(conversationId)
      queryClient.setQueryData(chatQueryKeys.conversations(), (previous) => {
        const typedPrevious = previous as ConversationInfiniteData | undefined
        return removeConversationFromListCache(typedPrevious, conversationId)
      })
      onConversationHidden?.()
      toast.success(t("chat.toasts.conversationHidden"))
    } catch (error) {
      toast.error(getChatApiErrorMessage(error, t))
    } finally {
      setHidePending(false)
      setHideOpen(false)
    }
  }

  const conversationTitle = conversation
    ? getConversationTitle(conversation, currentUserId)
    : ""
  const muted = conversation
    ? isConversationMuted(conversation, currentUserId ?? "")
    : false

  if (conversationQuery.isError) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold">{t("chat.states.errorTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {getChatApiErrorMessage(conversationQuery.error, t)}
          </p>
        </div>
      </div>
    )
  }

  if (!conversationQuery.isLoading && !conversation) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold">{t("chat.states.emptyTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("chat.states.emptyDescription")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background">
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          {isMobile && onBack ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={onBack}
              aria-label={t("chat.actions.back")}
            >
              <ArrowLeft className="size-4" />
            </Button>
          ) : null}

          <Avatar className="mt-0.5 size-10 shrink-0">
            <AvatarImage src="" alt={conversationTitle} />
            <AvatarFallback className="bg-muted text-xs font-semibold">
              {getInitials(conversationTitle)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-base font-semibold">
                {conversationTitle || t("chat.states.loadingTitle")}
              </h1>
              {conversation && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {getConversationTypeLabel(conversation, t)}
                </Badge>
              )}
              {muted && (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 px-1.5 text-[10px]"
                >
                  <BellOff className="size-3" />
                  {t("chat.labels.muted")}
                </Badge>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {conversation
                ? getConversationMetadataLabel(conversation, t)
                : ""}
            </p>
            {conversation?.lastMessageAt && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {t("chat.labels.lastMessageAt", {
                  value: formatChatTime(conversation.lastMessageAt, locale),
                  defaultValue: formatRelativeChatTime(
                    conversation.lastMessageAt,
                    locale
                  ),
                })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={isConnected ? "secondary" : "outline"}
            className={cn(
              "h-7",
              isConnected
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                : "text-muted-foreground"
            )}
          >
            {isConnected
              ? t("chat.connection.connected")
              : isReconnecting
                ? t("chat.connection.reconnecting")
                : t("chat.connection.offline")}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={t("chat.actions.menu")}
              >
                <MessageSquare className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuItem onSelect={() => setMuteOpen(true)}>
                {muted ? (
                  <BellRing className="size-4" />
                ) : (
                  <BellOff className="size-4" />
                )}
                {muted ? t("chat.actions.unmute") : t("chat.actions.mute")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setHideOpen(true)}
                variant="destructive"
              >
                <Trash2 className="size-4" />
                {t("chat.actions.hideConversation")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-b px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={messageSearchInput}
            onChange={(event) => setMessageSearchInput(event.target.value)}
            placeholder={t("chat.messages.searchPlaceholder")}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1" onScrollCapture={handleScroll}>
        <div
          ref={scrollAreaRef}
          className="flex min-h-full flex-col gap-4 px-4 py-4"
        >
          {messagesQuery.isLoading || conversationQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-end gap-2">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-14 w-2/3 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : messagesQuery.isError ? (
            <div className="flex flex-1 items-center justify-center py-10">
              <div className="max-w-md text-center">
                <p className="text-sm font-semibold">
                  {t("chat.states.errorTitle")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {getChatApiErrorMessage(messagesQuery.error, t)}
                </p>
              </div>
            </div>
          ) : mergedMessages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-16 text-center">
              <div className="max-w-md">
                <p className="text-sm font-medium">
                  {t("chat.messages.emptyTitle")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {debouncedSearch
                    ? t("chat.messages.searchEmpty")
                    : t("chat.messages.emptyDescription")}
                </p>
              </div>
            </div>
          ) : (
            <>
              {messagesQuery.hasNextPage && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadOlderMessages}
                    disabled={messagesQuery.isFetchingNextPage}
                  >
                    {messagesQuery.isFetchingNextPage ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    {t("chat.messages.loadOlder")}
                  </Button>
                </div>
              )}

              {mergedMessages.map((message) => {
                const isOwn = message.senderId === currentUserId
                const draft = draftMessages.find(
                  (item) =>
                    item.id === message.id ||
                    item.metadata?.clientRequestId ===
                      message.metadata?.clientRequestId
                )

                const renderMessage =
                  draft && draft.clientStatus
                    ? { ...message, clientStatus: draft.clientStatus }
                    : message

                return (
                  <MessageBubble
                    key={message.id}
                    message={
                      renderMessage as ChatMessage & {
                        clientStatus?: "sending" | "failed"
                      }
                    }
                    isOwn={isOwn}
                    locale={locale}
                    currentUserName={
                      currentUserId
                        ? getParticipantName(conversation!, currentUserId)
                        : null
                    }
                    onEdit={
                      isOwn && message.type === "TEXT" && !message.deletedAt
                        ? (nextMessage) => {
                            setEditTarget(nextMessage)
                            setEditValue(nextMessage.body ?? "")
                          }
                        : undefined
                    }
                    onDelete={
                      isOwn && !message.deletedAt
                        ? (nextMessage) => setDeleteTarget(nextMessage)
                        : undefined
                    }
                    onRetry={
                      draft?.clientStatus === "failed"
                        ? (nextMessage) => {
                            void handleRetryMessage({
                              ...(nextMessage as DraftMessage),
                              clientRequestId:
                                (nextMessage.metadata
                                  ?.clientRequestId as string) ??
                                nextMessage.id,
                              clientStatus: "failed",
                            })
                          }
                        : undefined
                    }
                  />
                )
              })}

              {typingPayload?.isTyping &&
                typingPayload.userId !== currentUserId && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span>
                      {typingUserName} {t("chat.labels.typing")}
                    </span>
                  </div>
                )}
            </>
          )}
        </div>
      </ScrollArea>

      <MessageComposer
        value={composerValue}
        onChange={setComposerValue}
        onSubmit={() => {
          void handleSendText()
        }}
        onUploadMedia={handleUploadMedia}
        isSending={sending}
      />

      <AlertDialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("chat.dialog.editTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("chat.dialog.editDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Input
              value={editValue}
              onChange={(event) =>
                setEditValue(event.target.value.slice(0, 4000))
              }
              maxLength={4000}
            />
            <p className="text-xs text-muted-foreground">
              {t("chat.composer.remaining", {
                count: Math.max(0, 4000 - editValue.length),
              })}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handleEditMessage()
              }}
            >
              {t("chat.actions.save")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("chat.dialog.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("chat.dialog.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handleDeleteMessage()
              }}
            >
              {t("chat.actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={hideOpen} onOpenChange={setHideOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("chat.dialog.hideTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("chat.dialog.hideDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={hidePending}
              onClick={(event) => {
                event.preventDefault()
                void handleHideConversation()
              }}
            >
              {hidePending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {t("chat.actions.hideConversation")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={muteOpen} onOpenChange={setMuteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("chat.dialog.muteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("chat.dialog.muteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            {[
              { label: t("chat.mute.1h"), value: 60 * 60 * 1000 },
              { label: t("chat.mute.8h"), value: 8 * 60 * 60 * 1000 },
              { label: t("chat.mute.1d"), value: 24 * 60 * 60 * 1000 },
            ].map((item) => (
              <Button
                key={item.label}
                type="button"
                variant="outline"
                onClick={() => {
                  void handleMuteConversation(
                    new Date(Date.now() + item.value).toISOString()
                  )
                  setMuteOpen(false)
                }}
                disabled={muting}
              >
                {item.label}
              </Button>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void handleMuteConversation(null)
                setMuteOpen(false)
              }}
              disabled={muting || !muted}
            >
              {t("chat.actions.unmute")}
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
