"use client"

import {
  CheckCheck,
  Clock3,
  Edit3,
  ImageOff,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import type { ChatMessage } from "../types"
import { formatChatTime } from "../utils/chat-date"

type RenderMessage = ChatMessage & {
  clientStatus?: "sending" | "failed"
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
}

function isSafeMediaUrl(value: string | null | undefined) {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

interface MessageBubbleProps {
  message: RenderMessage
  isOwn: boolean
  locale: "vi" | "en"
  currentUserName?: string | null
  onEdit?: (message: RenderMessage) => void
  onDelete?: (message: RenderMessage) => void
  onRetry?: (message: RenderMessage) => void
}

export function MessageBubble({
  message,
  isOwn,
  locale,
  currentUserName,
  onEdit,
  onDelete,
  onRetry,
}: MessageBubbleProps) {
  const { t } = useTranslation("common")
  const [mediaLoadFailed, setMediaLoadFailed] = useState(false)
  const showOwnActions =
    isOwn &&
    message.type === "TEXT" &&
    !message.deletedAt &&
    Boolean(onEdit || onDelete)

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isOwn ? (
        <Avatar className="size-8 shrink-0 self-end">
          <AvatarImage
            src=""
            alt={message.sender?.name ?? t("chat.labels.user")}
          />
          <AvatarFallback className="bg-muted text-[10px] font-semibold">
            {getInitials(message.sender?.name ?? "")}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="size-8 shrink-0" />
      )}

      <div
        className={cn(
          "group relative max-w-[min(42rem,calc(100%-3rem))] rounded-2xl px-3 py-2 text-sm shadow-sm",
          isOwn
            ? "bg-primary text-primary-foreground"
            : "border bg-card text-foreground"
        )}
      >
        {showOwnActions && (
          <div className="absolute top-1 right-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-7 rounded-full",
                    isOwn
                      ? "text-primary-foreground hover:bg-primary-foreground/10"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label={t("chat.actions.messageMenu")}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onSelect={() => onEdit(message)}>
                    <Edit3 className="size-4" />
                    {t("chat.actions.edit")}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => onDelete(message)}
                  >
                    <Trash2 className="size-4" />
                    {t("chat.actions.delete")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {!isOwn && (
          <div className="mb-1 flex items-center gap-1">
            <p className="text-xs font-medium text-muted-foreground">
              {message.sender?.name ?? currentUserName ?? t("chat.labels.user")}
            </p>
          </div>
        )}

        {message.deletedAt ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trash2 className="size-4 shrink-0" />
            <p>{t("chat.labels.deletedMessage")}</p>
          </div>
        ) : message.type === "SYSTEM" ? (
          <p className="text-sm break-words whitespace-pre-wrap italic">
            {message.body ?? t("chat.labels.systemMessage")}
          </p>
        ) : message.type === "MEDIA" &&
          isSafeMediaUrl(message.mediaUrl) &&
          !mediaLoadFailed ? (
          <div className="space-y-2">
            {message.body ? (
              <p className="break-words whitespace-pre-wrap">{message.body}</p>
            ) : null}
            <div className="overflow-hidden rounded-xl border bg-background/40">
              <img
                src={message.mediaUrl as string}
                alt={message.body ?? t("chat.labels.mediaMessage")}
                className="max-h-80 w-full object-cover"
                loading="lazy"
                onError={() => setMediaLoadFailed(true)}
              />
            </div>
          </div>
        ) : message.type === "MEDIA" ? (
          <div className="flex items-center gap-2">
            <ImageOff className="size-4 shrink-0" />
            <p className="break-words whitespace-pre-wrap">
              {message.body || t("chat.labels.mediaMessage")}
            </p>
          </div>
        ) : (
          <p className="break-words whitespace-pre-wrap">{message.body}</p>
        )}

        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-2 text-[11px]",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {message.editedAt && (
            <span className="inline-flex items-center gap-1">
              <Edit3 className="size-3" />
              {t("chat.labels.edited")}
            </span>
          )}

          {message.clientStatus === "sending" && (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3" />
              {t("chat.labels.sending")}
            </span>
          )}

          {message.clientStatus === "failed" && (
            <button
              type="button"
              className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2"
              onClick={() => onRetry?.(message)}
            >
              <Clock3 className="size-3" />
              {t("chat.labels.failed")}
            </button>
          )}

          <span>{formatChatTime(message.createdAt, locale)}</span>
          {isOwn && !message.deletedAt && message.clientStatus !== "failed" && (
            <CheckCheck className="size-3.5" />
          )}
        </div>
      </div>
    </div>
  )
}
