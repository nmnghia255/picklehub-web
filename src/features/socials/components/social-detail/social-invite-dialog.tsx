"use client"

import {
  Check,
  Copy,
  Link,
  Loader2,
  Search,
  UserPlus,
  Users,
} from "lucide-react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FriendUser } from "@/features/friend/types"
import {
  getShareLinkAction,
  listFriendsAction,
  listSentInvitationsAction,
  sendDirectInvitationsAction,
} from "@/features/socials/actions/invitation-actions"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

interface SocialInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  socialId: string
}

export default function SocialInviteDialog({
  open,
  onOpenChange,
  socialId,
}: SocialInviteDialogProps) {
  const { t } = useSocialsTranslation()

  // ── Friends tab state ──────────────────────────────────────────
  const [friends, setFriends] = useState<FriendUser[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [search, setSearch] = useState("")
  /** Set of userId đã được mời thành công (persisted + optimistic) */
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set())
  /** Set of userId đang trong quá trình gọi API */
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  // ── Share link tab state ───────────────────────────────────────
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [loadingLink, setLoadingLink] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load friends + already-invited list when dialog opens ──────
  useEffect(() => {
    if (!open) return

    let isSubscribed = true
    Promise.all([
      listFriendsAction(),
      listSentInvitationsAction(socialId).catch(() => []),
    ])
      .then(([friendList, sentInvitations]) => {
        if (!isSubscribed) return
        setFriends(friendList)

        // Pre-populate invited set from existing PENDING/ACCEPTED invitations
        const alreadyInvited = new Set<string>(
          sentInvitations
            .filter(
              (inv) => inv.status === "PENDING" || inv.status === "ACCEPTED"
            )
            .map((inv) => inv.inviteeId)
            .filter((id): id is string => Boolean(id))
        )
        setInvitedIds(alreadyInvited)
      })
      .finally(() => {
        if (isSubscribed) setLoadingFriends(false)
      })

    return () => {
      isSubscribed = false
    }
  }, [open, socialId])

  // ── Cleanup copy timeout on unmount ───────────────────────────
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  // ── Handle invite a single friend ─────────────────────────────
  const handleInvite = useCallback(
    async (friend: FriendUser) => {
      if (pendingIds.has(friend.id) || invitedIds.has(friend.id)) return

      setPendingIds((prev) => new Set(prev).add(friend.id))
      try {
        await sendDirectInvitationsAction(socialId, [friend.id])
        setInvitedIds((prev) => new Set(prev).add(friend.id))
        toast.success(t("invitation.inviteSuccess"))
      } catch {
        toast.error(t("invitation.inviteError"))
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev)
          next.delete(friend.id)
          return next
        })
      }
    },
    [invitedIds, pendingIds, socialId, t]
  )

  // ── Load share link (lazy, on tab switch) ─────────────────────
  const handleTabChange = useCallback(
    async (value: string) => {
      if (value !== "link" || shareUrl !== null || loadingLink) return

      setLoadingLink(true)
      try {
        const data = await getShareLinkAction(socialId)
        const origin =
          typeof window !== "undefined" ? window.location.origin : ""
        setShareUrl(`${origin}${data.shareUrl}`)
      } catch {
        toast.error(t("invitation.linkLoadError"))
      } finally {
        setLoadingLink(false)
      }
    },
    [loadingLink, shareUrl, socialId, t]
  )

  // ── Copy share link to clipboard ──────────────────────────────
  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success(t("invitation.linkCopied"))
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t("invitation.linkLoadError"))
    }
  }, [shareUrl, t])

  // ── Filtered friends list ─────────────────────────────────────
  const filteredFriends = friends.filter((f) =>
    f.fullName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            {t("invitation.openDialog")}
          </DialogTitle>
          <DialogDescription>
            {t("invitation.shareDescription")}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="friends"
          onValueChange={handleTabChange}
          className="flex flex-col"
        >
          <TabsList className="mx-6 mb-0 grid grid-cols-2">
            <TabsTrigger value="friends" className="gap-1.5">
              <UserPlus className="size-3.5" />
              {t("invitation.tabFriends")}
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-1.5">
              <Link className="size-3.5" />
              {t("invitation.tabLink")}
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Mời bạn bè ── */}
          <TabsContent value="friends" className="mt-0 px-6 pb-6">
            {/* Search box */}
            <div className="relative mt-4 mb-3">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("invitation.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Friend list */}
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {loadingFriends ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("invitation.loadingFriends")}
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t("invitation.noFriends")}
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const isInvited = invitedIds.has(friend.id)
                  const isPending = pendingIds.has(friend.id)

                  return (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2.5 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar className="size-9 shrink-0">
                          <AvatarImage
                            src={friend.avatarUrl}
                            alt={friend.fullName}
                          />
                          <AvatarFallback className="text-xs">
                            {friend.fullName.slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="truncate text-sm font-medium">
                          {friend.fullName}
                        </p>
                      </div>

                      {/* 3-state invite button */}
                      {isInvited ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="h-8 shrink-0 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                        >
                          <Check className="mr-1 size-3.5" />
                          {t("invitation.invitedDone")}
                        </Button>
                      ) : isPending ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="h-8 shrink-0 text-muted-foreground"
                        >
                          <Loader2 className="mr-1 size-3.5 animate-spin" />
                          {t("invitation.invitingSending")}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 shrink-0"
                          onClick={() => handleInvite(friend)}
                        >
                          <UserPlus className="mr-1 size-3.5" />
                          {t("invitation.inviteButton")}
                        </Button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* ── Tab 2: Link chia sẻ ── */}
          <TabsContent value="link" className="mt-0 px-6 pb-6">
            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">
                  {t("invitation.shareTitle")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("invitation.shareDescription")}
                </p>
              </div>

              {loadingLink ? (
                <div className="flex items-center justify-center rounded-xl border bg-muted/40 py-6 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("invitation.loadingFriends")}
                </div>
              ) : shareUrl ? (
                <div className="space-y-3">
                  {/* URL display */}
                  <div className="rounded-xl border bg-muted/40 px-3 py-2.5">
                    <p className="truncate font-mono text-xs text-muted-foreground select-all">
                      {shareUrl}
                    </p>
                  </div>

                  {/* Copy button */}
                  <Button
                    className="w-full"
                    onClick={handleCopyLink}
                    variant={copied ? "outline" : "default"}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 size-4 text-emerald-500" />
                        {t("invitation.linkCopied")}
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 size-4" />
                        {t("invitation.copyLink")}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed py-6 text-center text-sm text-muted-foreground">
                  {t("invitation.linkLoadError")}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
