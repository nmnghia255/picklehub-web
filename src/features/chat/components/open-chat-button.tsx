"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { chatClient } from "../api/chat-client"
import { chatQueryKeys } from "../api/chat-keys"
import type { ChatApiError } from "../types"

type OpenChatKind = "direct" | "group" | "social" | "tournament"

interface OpenChatButtonProps {
  kind: OpenChatKind
  targetId: string
  label: string
  className?: string
  variant?: ComponentProps<typeof Button>["variant"]
  size?: ComponentProps<typeof Button>["size"]
  showIcon?: boolean
  disabled?: boolean
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement>,
    trigger: () => void
  ) => void
}

function getChatErrorMessage(
  error: unknown,
  t: (key: string, options?: Record<string, unknown>) => string,
  kind: OpenChatKind
) {
  const chatError = error as ChatApiError | null
  const body = chatError?.body

  if (kind === "social" && chatError?.status === 404) {
    return t("chat.errors.socialNotFound")
  }

  if (body && typeof body === "object" && "message" in body) {
    const message = body.message
    if (Array.isArray(message)) {
      return message.filter(Boolean).join(", ")
    }
    if (typeof message === "string" && message.trim()) {
      return message
    }
  }

  switch (chatError?.status) {
    case 401:
      return t("chat.errors.unauthorized")
    case 403:
      return t("chat.errors.forbidden")
    case 404:
      return t("chat.errors.notFound")
    case 400:
      return t("chat.errors.invalidRequest")
    default:
      return t("chat.errors.generic")
  }
}

export function OpenChatButton({
  kind,
  targetId,
  label,
  className,
  variant = "outline",
  size = "default",
  showIcon = true,
  disabled,
  onClick,
}: OpenChatButtonProps) {
  const { t } = useTranslation("common")
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      switch (kind) {
        case "direct":
          return chatClient.createDirectConversation({ userId: targetId })
        case "group":
          return chatClient.createGroupConversation({ groupId: targetId })
        case "social":
          return chatClient.createSocialConversation({ socialId: targetId })
        case "tournament":
          return chatClient.createTournamentConversation({
            tournamentId: targetId,
          })
      }
    },
    onSuccess: (conversation) => {
      if (conversation?.id) {
        queryClient.setQueryData(
          chatQueryKeys.conversation(conversation.id),
          conversation
        )
      }
      router.push(`/chat?conversationId=${conversation.id}`)
    },
    onError: (error) => {
      toast.error(getChatErrorMessage(error, t, kind))
    },
  })

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || mutation.isPending}
      onClick={(e) => {
        if (onClick) {
          onClick(e, () => mutation.mutate())
        } else {
          mutation.mutate()
        }
      }}
    >
      {showIcon && <MessageSquare className="mr-2 size-4" />}
      {mutation.isPending ? t("chat.actions.opening") : label}
    </Button>
  )
}
