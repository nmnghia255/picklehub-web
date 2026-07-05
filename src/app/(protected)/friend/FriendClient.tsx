"use client"

import { Search, UserCheck, UserPlus, UserRoundX, XCircle } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FriendUser, SortKey, TabKey } from "@/features/friend/types"
import {
  filterUsersByUsername,
  getInitials,
  sortUsers,
} from "@/features/friend/utils"

type UsersByTab = Record<TabKey, FriendUser[]>

export default function FriendClient({
  initialUsersByTab,
}: {
  initialUsersByTab: UsersByTab
}) {
  const { t } = useTranslation("common")

  const [activeTab, setActiveTab] = useState<TabKey>("find")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("alphabet")
  const [usersByTab, setUsersByTab] = useState<UsersByTab>(initialUsersByTab)
  const [selectedUser, setSelectedUser] = useState<FriendUser | null>(null)
  const [isLoadingFind, setIsLoadingFind] = useState(false)
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>(
    {}
  )
  const findRequestIdRef = useRef(0)

  useEffect(() => {
    const requestId = ++findRequestIdRef.current
    const shouldLoadFindUsers = activeTab === "find"

    async function loadFindUsers() {
      if (!shouldLoadFindUsers) {
        return
      }

      const keyword = search.trim() || "a"

      setIsLoadingFind(true)

      try {
        const query = new URLSearchParams({
          q: keyword,
          page: "1",
          limit: "100",
        })

        const response = await fetch(`/api/friends/find?${query.toString()}`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        })

        if (!response.ok) return

        const payload = (await response.json()) as {
          data?: FriendUser[]
        }

        if (
          requestId === findRequestIdRef.current &&
          Array.isArray(payload.data)
        ) {
          setUsersByTab((prev) => ({
            ...prev,
            find: payload.data ?? prev.find,
          }))
        }
      } catch (error) {
        if (requestId === findRequestIdRef.current) {
          throw error
        }
      } finally {
        if (requestId === findRequestIdRef.current) {
          setIsLoadingFind(false)
        }
      }
    }

    void loadFindUsers()

    return () => {}
  }, [activeTab, search])

  const users = useMemo(() => {
    const rawUsers = usersByTab[activeTab]
    if (activeTab === "find") {
      return sortUsers(rawUsers, sortBy)
    }

    const byKeyword = filterUsersByUsername(rawUsers, search)
    return sortUsers(byKeyword, sortBy)
  }, [activeTab, search, sortBy, usersByTab])

  const runAction = async (key: string, fn: () => Promise<void>) => {
    if (processingIds[key]) {
      return
    }

    setProcessingIds((prev) => ({ ...prev, [key]: true }))
    try {
      await fn()
    } finally {
      setProcessingIds((prev) => ({ ...prev, [key]: false }))
    }
  }

  const handleSendRequest = async (user: FriendUser) => {
    await runAction(`find-${user.id}`, async () => {
      const response = await fetch("/api/friends/requests", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: user.id }),
      })

      if (!response.ok) {
        return
      }

      const payload = (await response.json()) as { data?: { id?: string } }
      const requestId = payload.data?.id ?? user.id

      setUsersByTab((prev) => ({
        ...prev,
        find: prev.find.filter((item) => item.id !== user.id),
        sent: [
          {
            ...user,
            id: requestId,
            counterpartId: user.id,
            invitedAt: new Date().toISOString(),
            inviteSource: "Web",
            bio: "Lời mời kết bạn đã gửi",
          },
          ...prev.sent,
        ],
      }))
    })
  }

  const handleCancelRequest = async (requestId: string) => {
    await runAction(`sent-${requestId}`, async () => {
      const response = await fetch(
        `/api/friends/requests/${requestId}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
        }
      )

      if (!response.ok) {
        return
      }

      setUsersByTab((prev) => ({
        ...prev,
        sent: prev.sent.filter((item) => item.id !== requestId),
      }))
    })
  }

  const handleAcceptRequest = async (request: FriendUser) => {
    const requestId = request.id
    await runAction(`received-accept-${requestId}`, async () => {
      const response = await fetch(
        `/api/friends/requests/${requestId}/accept`,
        {
          method: "PATCH",
          credentials: "include",
        }
      )

      if (!response.ok) {
        return
      }

      const friendUser: FriendUser = {
        ...request,
        id: request.counterpartId ?? request.id,
        bio: "Đã là bạn bè",
        becameFriendAt: new Date().toISOString(),
        friendshipSinceLabel: "Vừa kết bạn",
      }

      setUsersByTab((prev) => ({
        ...prev,
        received: prev.received.filter((item) => item.id !== requestId),
        friends: [friendUser, ...prev.friends],
      }))
    })
  }

  const handleRejectRequest = async (requestId: string) => {
    await runAction(`received-reject-${requestId}`, async () => {
      const response = await fetch(
        `/api/friends/requests/${requestId}/reject`,
        {
          method: "PATCH",
          credentials: "include",
        }
      )

      if (!response.ok) {
        return
      }

      setUsersByTab((prev) => ({
        ...prev,
        received: prev.received.filter((item) => item.id !== requestId),
      }))
    })
  }

  const handleRemoveFriend = async (friendId: string) => {
    await runAction(`friends-${friendId}`, async () => {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        return
      }

      setUsersByTab((prev) => ({
        ...prev,
        friends: prev.friends.filter((item) => item.id !== friendId),
      }))
    })
  }

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6 rounded-2xl border bg-linear-to-r from-primary/10 via-sky-500/5 to-emerald-500/10 p-5">
        <h1 className="text-3xl font-bold">{t("friends.pageTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("friends.pageDescription")}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabKey)}
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 md:grid-cols-4">
          <TabsTrigger value="find">{t("friends.tabs.find")}</TabsTrigger>
          <TabsTrigger value="sent">{t("friends.tabs.sent")}</TabsTrigger>
          <TabsTrigger value="received">
            {t("friends.tabs.received")}
          </TabsTrigger>
          <TabsTrigger value="friends">{t("friends.tabs.friends")}</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder={t("friends.searchPlaceholder")}
            />
          </div>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortKey)}
          >
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue placeholder={t("friends.sort.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabet">
                {t("friends.sort.alphabet")}
              </SelectItem>
              <SelectItem value="friendTime">
                {t("friends.sort.friendTime")}
              </SelectItem>
              <SelectItem value="inviteTime">
                {t("friends.sort.inviteTime")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(Object.keys(initialUsersByTab) as TabKey[]).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {t(`friends.headings.${tab}`)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {tab === "find" && isLoadingFind
                      ? t("friends.subtitle.findLoading")
                      : t("friends.subtitle.count", { count: users.length })}
                  </p>
                </div>
              </div>

              {users.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  {t("friends.empty")}
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => setSelectedUser(user)}
                          aria-label={t("friends.aria.viewProfile", {
                            username: user.username,
                          })}
                        >
                          <Avatar size="lg" className="ring-2 ring-background">
                            <AvatarImage
                              src={user.avatarUrl}
                              alt={user.fullName}
                            />
                            <AvatarFallback>
                              {getInitials(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                        </button>

                        <div>
                          <p className="font-semibold">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            @{user.username}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="secondary">{user.level}</Badge>
                            <Badge variant="outline">{user.location}</Badge>
                            <Badge variant="ghost">
                              {t("friends.badge.mutualFriends", {
                                count: user.mutualFriends,
                              })}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <div className="mt-1 flex flex-wrap gap-2">
                          {tab === "find" &&
                            (() => {
                              const status = user.friendshipStatus ?? "NONE"
                              const canSendRequest = status === "NONE"

                              const statusKey =
                                status === "FRIEND"
                                  ? "friend"
                                  : status === "REQUEST_SENT"
                                    ? "requestSent"
                                    : status === "REQUEST_RECEIVED"
                                      ? "requestReceived"
                                      : "addFriend"

                              const actionLabel = t(
                                `friends.status.${statusKey}`
                              )

                              return status === "FRIEND" ? (
                                <Button
                                  size="sm"
                                  disabled
                                  aria-label={t("friends.status.friend")}
                                  className="bg-gray-100 text-gray-800 hover:bg-gray-100"
                                >
                                  <UserCheck
                                    className="mr-2 size-5 text-emerald-700"
                                    strokeWidth={1.8}
                                  />
                                  <span className="font-semibold text-gray-800">
                                    {t("friends.status.friend")}
                                  </span>
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  disabled={
                                    !canSendRequest ||
                                    Boolean(processingIds[`find-${user.id}`])
                                  }
                                  onClick={() => handleSendRequest(user)}
                                >
                                  <UserPlus className="size-4" />
                                  {actionLabel}
                                </Button>
                              )
                            })()}

                          {tab === "sent" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={Boolean(
                                processingIds[`sent-${user.id}`]
                              )}
                              onClick={() => handleCancelRequest(user.id)}
                            >
                              <XCircle className="size-4" />
                              {t("friends.actions.cancelRequest")}
                            </Button>
                          )}

                          {tab === "received" && (
                            <>
                              <Button
                                size="sm"
                                disabled={Boolean(
                                  processingIds[`received-accept-${user.id}`]
                                )}
                                onClick={() => handleAcceptRequest(user)}
                              >
                                {t("friends.actions.accept")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={Boolean(
                                  processingIds[`received-reject-${user.id}`]
                                )}
                                onClick={() => handleRejectRequest(user.id)}
                              >
                                {t("friends.actions.reject")}
                              </Button>
                            </>
                          )}

                          {tab === "friends" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={Boolean(
                                  processingIds[`friends-${user.id}`]
                                )}
                                onClick={() => handleRemoveFriend(user.id)}
                              >
                                <UserRoundX className="size-4" />
                                {t("friends.actions.unfriend")}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog
        open={Boolean(selectedUser)}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent>
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>{t("friends.dialog.title")}</DialogTitle>
                <DialogDescription>
                  {t("friends.dialog.description")}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-start gap-4">
                <Avatar size="lg">
                  <AvatarImage
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.fullName}
                  />
                  <AvatarFallback>
                    {getInitials(selectedUser.fullName)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-lg font-semibold">
                    {selectedUser.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{selectedUser.username}
                  </p>
                  <p className="mt-2 text-sm">{selectedUser.bio}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">{selectedUser.level}</Badge>
                    <Badge variant="outline">{selectedUser.location}</Badge>
                    <Badge variant="ghost">
                      {t("friends.badge.mutualFriends", {
                        count: selectedUser.mutualFriends,
                      })}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
