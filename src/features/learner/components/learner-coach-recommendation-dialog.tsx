"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRecommendCoach } from "@/features/coach/hooks/use-coach-queries"

interface FriendItem {
  id: string
  name: string
  email: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function extractFriends(payload: unknown): FriendItem[] {
  if (Array.isArray(payload)) {
    return payload.map(toFriendItem)
  }

  if (!isRecord(payload)) return []

  const maybeData = payload.data

  if (Array.isArray(maybeData)) {
    return maybeData.map(toFriendItem)
  }

  if (isRecord(maybeData) && Array.isArray(maybeData.data)) {
    return maybeData.data.map(toFriendItem)
  }

  return []
}

function toFriendItem(item: unknown): FriendItem {
  const obj = (item ?? {}) as Record<string, unknown>
  const friend = (obj.friend ?? {}) as Record<string, unknown>
  return {
    id: String(obj.friendId ?? obj.id ?? ""),
    name: String(friend.name ?? obj.name ?? ""),
    email: String(friend.email ?? obj.email ?? ""),
  }
}

export function LearnerCoachRecommendationDialog({
  coachId,
  coachName,
}: {
  coachId: string
  coachName: string
}) {
  const { t } = useTranslation("common")
  const [dialogEl, setDialogEl] = useState<HTMLDivElement | null>(null)
  const dialogRef = useCallback((el: HTMLDivElement | null) => {
    setDialogEl(el)
  }, [])
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [friends, setFriends] = useState<FriendItem[] | null>(null)
  const [selectedId, setSelectedId] = useState("")
  const [selectedFriend, setSelectedFriend] = useState<FriendItem | null>(null)

  const recommendMutation = useRecommendCoach()

  useEffect(() => {
    if (!open || friends !== null) return
    fetch("/api/proxy/friends", { credentials: "same-origin" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        console.log("[recommendation] GET /api/proxy/friends response:", data)
        const mapped = extractFriends(data)
        console.log("[recommendation] mapped friends:", mapped)
        setFriends(mapped)
      })
      .catch((err) => {
        console.error("[recommendation] failed to fetch friends:", err)
        setFriends([])
      })
  }, [open, friends])

  const handleSubmit = () => {
    if (!selectedId) return
    recommendMutation.mutate(
      {
        coachId,
        dto: {
          recommendedToId: selectedId,
          message: message.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false)
          setSelectedId("")
          setSelectedFriend(null)
          setMessage("")
        },
      }
    )
  }

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    recommendMutation.reset()
  }

  const handleFriendChange = (value: string | null) => {
    recommendMutation.reset()
    const nextId = value ?? ""
    setSelectedId(nextId)
    setSelectedFriend(friends?.find((friend) => friend.id === nextId) ?? null)
  }

  const handleMessageChange = (value: string) => {
    recommendMutation.reset()
    setMessage(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button>{t("learner.recommendation.button")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" ref={dialogRef}>
        <DialogHeader>
          <DialogTitle>
            {t("learner.recommendation.dialogTitle", { coachName })}
          </DialogTitle>
          <DialogDescription>
            {t("learner.recommendation.dialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("learner.recommendation.selectFriend")}</Label>

            {friends === null ? (
              <div className="flex items-center justify-center rounded-md border border-input px-3 py-6 text-sm text-muted-foreground">
                {t("learner.recommendation.loadingFriends")}
              </div>
            ) : friends.length === 0 ? (
              <div className="flex items-center justify-center rounded-md border border-input px-3 py-6 text-sm text-muted-foreground">
                {t("learner.recommendation.noFriends")}
              </div>
            ) : (
              <Combobox
                value={selectedId}
                onValueChange={handleFriendChange}
                itemToStringLabel={(value) => {
                  if (typeof value !== "string") return ""
                  return (
                    friends?.find((friend) => friend.id === value)?.name ??
                    (value === selectedFriend?.id ? selectedFriend.name : "")
                  )
                }}
              >
                <ComboboxInput
                  placeholder={t("learner.recommendation.searchFriends")}
                  showClear={!!selectedId}
                />
                <ComboboxContent container={dialogEl ?? undefined}>
                  <ComboboxList>
                    {friends.map((friend) => (
                      <ComboboxItem key={friend.id} value={friend.id}>
                        <Avatar className="size-6">
                          <AvatarImage
                            src={`https://i.pravatar.cc/160?u=${encodeURIComponent(friend.id)}`}
                            alt={friend.name}
                          />
                          <AvatarFallback>
                            {(
                              friend.name ||
                              t("learner.recommendation.unknownFriend")
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {friend.name ||
                              t("learner.recommendation.unknownFriend")}
                          </span>
                          {friend.email && (
                            <span className="text-xs text-muted-foreground">
                              {friend.email}
                            </span>
                          )}
                        </div>
                      </ComboboxItem>
                    ))}
                    <ComboboxEmpty className="p-4 text-center text-sm text-muted-foreground">
                      {t("learner.recommendation.noResults")}
                    </ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendMessage">
              {t("learner.recommendation.messageLabel")}
            </Label>
            <Textarea
              id="recommendMessage"
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              rows={3}
              placeholder={t("learner.recommendation.messagePlaceholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("learner.recommendation.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={recommendMutation.isPending || !selectedId}
          >
            {recommendMutation.isPending
              ? t("learner.recommendation.sending")
              : t("learner.recommendation.send")}
          </Button>
        </DialogFooter>
        {recommendMutation.isSuccess && (
          <p className="text-sm font-medium text-green-600">
            {t("learner.recommendation.success")}
          </p>
        )}
        {recommendMutation.isError && (
          <p className="text-sm font-medium text-destructive">
            {recommendMutation.error?.message ??
              t("learner.recommendation.error")}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
