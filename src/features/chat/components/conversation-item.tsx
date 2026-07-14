"use client"

import { BellOff } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { Conversation } from "../types"
import { getConversationTitle, isConversationMuted } from "../utils/chat-cache"
import { formatChatTime, formatRelativeChatTime } from "../utils/chat-date"

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

interface ConversationItemProps {
  conversation: Conversation
  currentUserId: string | null
  isActive: boolean
  onClick: () => void
}

export function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  onClick,
}: ConversationItemProps) {
  const { t, i18n } = useTranslation("common")
  const locale = i18n.resolvedLanguage?.startsWith("vi") ? "vi" : "en"
  const title =
    conversation.type === "DIRECT"
      ? getConversationTitle(conversation, currentUserId)
      : getConversationTitle(conversation, null)
  const muted = isConversationMuted(conversation, currentUserId ?? "")
  const lastMessageAt = formatRelativeChatTime(
    conversation.lastMessageAt,
    locale
  )
  const lastMessageTime = formatChatTime(conversation.lastMessageAt, locale)
  const preview =
    conversation.lastMessage?.type === "MEDIA"
      ? t("chat.labels.mediaMessage")
      : conversation.lastMessage?.type === "SYSTEM"
        ? (conversation.lastMessage?.body ?? t("chat.labels.systemMessage"))
        : (conversation.lastMessage?.body ?? "")

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "h-auto w-full justify-start rounded-none border-b px-4 py-3 text-left",
        isActive && "bg-accent/70"
      )}
    >
      <div className="flex w-full items-start gap-3">
        <Avatar className="mt-0.5 size-10 shrink-0">
          <AvatarImage src="" alt={title} />
          <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
            {getInitials(title)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {getConversationTypeLabel(conversation, t)}
                </Badge>
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
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[11px] text-muted-foreground">
                {lastMessageAt || lastMessageTime}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {preview || t("chat.conversationList.noPreview")}
            </p>
            {conversation.unreadCount > 0 && (
              <Badge className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Button>
  )
}
