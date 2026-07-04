"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { ErrorSection } from "@/components/error-section"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  approveGuestsClient,
  createGuestClient,
  deleteGuestClient,
  guestQueryKeys,
  listGuestsClient,
  ownerCancelGuestClient,
} from "../api/guests-client"
import type { CreateGuestInput, Guest } from "../types/guest-member"
import { CreateGuestMemberDialog } from "./create-guest-member-dialog"

function formatDate(value: string | null | undefined) {
  if (!value) return "-"
  const date = new Date(value)
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "KH"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
}

function getDisplayMember(guest: Guest) {
  return guest.member ?? guest.invitedBy
}

function GuestStatusBadge({ status }: { status: Guest["status"] }) {
  const baseStyles =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  switch (status) {
    case "PENDING":
    case "PENDING_APPROVAL":
      return (
        <span
          className={`${baseStyles} border-amber-500/20 bg-amber-500/10 text-amber-500`}
        >
          Chờ duyệt
        </span>
      )
    case "APPROVED":
    case "ACTIVE":
      return (
        <span
          className={`${baseStyles} border-emerald-500/20 bg-emerald-500/10 text-emerald-500`}
        >
          Đã duyệt
        </span>
      )
    case "REJECTED":
      return (
        <span
          className={`${baseStyles} border-rose-500/20 bg-rose-500/10 text-rose-500`}
        >
          Từ chối
        </span>
      )
    case "EXPIRED":
      return (
        <span
          className={`${baseStyles} border-zinc-500/20 bg-zinc-500/10 text-zinc-400`}
        >
          Hết hạn
        </span>
      )
    case "CANCELLED":
      return (
        <span
          className={`${baseStyles} border-zinc-500/20 bg-zinc-500/10 text-zinc-400`}
        >
          Đã hủy
        </span>
      )
    case "INACTIVE":
      return (
        <span
          className={`${baseStyles} border-zinc-500/20 bg-zinc-500/10 text-zinc-400`}
        >
          Ngưng hoạt động
        </span>
      )
    default:
      return (
        <span
          className={`${baseStyles} border-zinc-500/20 bg-zinc-500/10 text-zinc-400`}
        >
          {status}
        </span>
      )
  }
}

interface GuestMemberSectionProps {
  groupId: string
  currentUserId: string
  currentUserRole: string | null
}

export function GuestMemberSection({
  groupId,
  currentUserId,
  currentUserRole,
}: GuestMemberSectionProps) {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)

  const normalizedRole = currentUserRole?.toLowerCase()
  const isOwner = normalizedRole === "owner"

  const guestsQuery = useQuery({
    queryKey: guestQueryKeys.list(groupId, { limit: 100 }),
    queryFn: () => listGuestsClient(groupId, { limit: 100 }),
  })

  // Support both legacy and new statuses in grouping
  const pending = (guestsQuery.data ?? []).filter(
    (g) => g.status === "PENDING" || g.status === "PENDING_APPROVAL"
  )
  const approved = (guestsQuery.data ?? []).filter(
    (g) => g.status === "APPROVED" || g.status === "ACTIVE"
  )
  const rejected = (guestsQuery.data ?? []).filter(
    (g) => g.status === "REJECTED"
  )
  const inactive = (guestsQuery.data ?? []).filter(
    (g) =>
      g.status === "EXPIRED" ||
      g.status === "CANCELLED" ||
      g.status === "INACTIVE"
  )

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: guestQueryKeys.all(groupId) })

  const handleCreate = async (input: CreateGuestInput) => {
    try {
      await createGuestClient(groupId, input)
      toast.success("Đã gửi yêu cầu khách vãng lai.")
      await invalidate()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể tạo khách vãng lai."
      )
    }
  }

  const handleApproveAll = async () => {
    const ids = pending.map((g) => g.id)
    if (ids.length === 0) return
    try {
      await approveGuestsClient(groupId, { guestIds: ids, status: "APPROVED" })
      toast.success("Đã duyệt tất cả yêu cầu khách vãng lai.")
      await invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể duyệt.")
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveGuestsClient(groupId, {
        guestIds: [id],
        status: "APPROVED",
      })
      toast.success("Đã duyệt khách vãng lai.")
      await invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể duyệt.")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await approveGuestsClient(groupId, {
        guestIds: [id],
        status: "REJECTED",
      })
      toast.success("Đã từ chối yêu cầu khách vãng lai.")
      await invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể từ chối.")
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await (isOwner ? ownerCancelGuestClient : deleteGuestClient)(groupId, id)
      toast.success("Đã hủy yêu cầu khách vãng lai.")
      await invalidate()
      setConfirmOpen(false)
      setSelectedGuestId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể hủy yêu cầu.")
    }
  }

  const renderGuestRow = (guest: Guest) => {
    const displayMember = getDisplayMember(guest)
    // memberId in GroupGuest is a GroupMember record ID, NOT a user ID.
    // The user ID may be nested in member.userId or invitedBy.id depending on backend response shape.
    const isMyRequest =
      guest.memberId === currentUserId ||
      guest.invitedById === currentUserId ||
      (guest.member as Record<string, unknown>)?.userId === currentUserId ||
      guest.invitedBy?.id === currentUserId

    const guestsCount = guest.guestsCount ?? guest.guestCount ?? 0
    const sessionsCount = guest.sessionsCount ?? guest.sessionCount ?? 0
    const remainingSessions = guest.remainingSessions

    return (
      <TableRow key={guest.id}>
        <TableCell className="flex items-center gap-2 font-medium">
          <Avatar className="h-8 w-8">
            <AvatarImage src={displayMember?.avatarUrl || ""} />
            <AvatarFallback>
              {getInitials(displayMember?.name || "?")}
            </AvatarFallback>
          </Avatar>
          <span>{displayMember?.name || "-"}</span>
        </TableCell>
        <TableCell className="text-center font-semibold">
          {guestsCount}
        </TableCell>
        <TableCell className="text-center font-semibold">
          {guest.status === "APPROVED" || guest.status === "ACTIVE" ? (
            <span>
              <span className="font-bold text-primary">
                {remainingSessions ?? sessionsCount}
              </span>
              <span className="text-muted-foreground"> / {sessionsCount}</span>
            </span>
          ) : (
            sessionsCount
          )}
        </TableCell>
        <TableCell>{formatDate(guest.createdAt)}</TableCell>
        <TableCell>
          <GuestStatusBadge status={guest.status} />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            {/* OWNER: duyệt / từ chối yêu cầu đang chờ */}
            {isOwner &&
              (guest.status === "PENDING" ||
                guest.status === "PENDING_APPROVAL") && (
                <>
                  <Button
                    size="sm"
                    className="border-none bg-emerald-600 text-white shadow-xs transition-colors hover:bg-emerald-500"
                    onClick={() => handleApprove(guest.id)}
                  >
                    Duyệt
                  </Button>
                  <Button
                    size="sm"
                    className="border-none bg-rose-600 text-white shadow-xs transition-colors hover:bg-rose-500"
                    onClick={() => handleReject(guest.id)}
                  >
                    Từ chối
                  </Button>
                </>
              )}

            {/* OWNER: hủy hạn mức đã được duyệt */}
            {isOwner &&
              (guest.status === "APPROVED" || guest.status === "ACTIVE") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-rose-500/30 font-medium text-rose-400 transition-colors hover:border-rose-500/60 hover:bg-rose-500/10 hover:text-rose-300"
                  onClick={() => {
                    setSelectedGuestId(guest.id)
                    setConfirmOpen(true)
                  }}
                >
                  Hủy hạn mức
                </Button>
              )}

            {/* MEMBER: tự hủy yêu cầu của chính mình khi đang PENDING */}
            {!isOwner &&
              isMyRequest &&
              (guest.status === "PENDING" ||
                guest.status === "PENDING_APPROVAL") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-rose-500/30 font-medium text-rose-400 transition-colors hover:border-rose-500/60 hover:bg-rose-500/10 hover:text-rose-300"
                  onClick={() => {
                    setSelectedGuestId(guest.id)
                    setConfirmOpen(true)
                  }}
                >
                  Hủy yêu cầu
                </Button>
              )}
          </div>
        </TableCell>
      </TableRow>
    )
  }

  const tableHeader = (showActions = true) => (
    <TableHeader>
      <TableRow>
        <TableHead>Người yêu cầu</TableHead>
        <TableHead className="text-center">Số lượng khách</TableHead>
        <TableHead className="text-center">Số buổi (còn lại / tổng)</TableHead>
        <TableHead>Thời gian yêu cầu</TableHead>
        <TableHead>Trạng thái</TableHead>
        {showActions && <TableHead className="text-right">Thao tác</TableHead>}
      </TableRow>
    </TableHeader>
  )

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Khách vãng lai</CardTitle>
          <div className="flex gap-2">
            {isOwner && pending.length > 0 && (
              <Button size="sm" variant="outline" onClick={handleApproveAll}>
                Duyệt tất cả ({pending.length})
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-2 size-4" />
              Gửi yêu cầu
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {guestsQuery.isPending ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Đang tải...
          </div>
        ) : guestsQuery.isError ? (
          <ErrorSection
            title="Lỗi tải dữ liệu"
            message="Không thể tải danh sách khách vãng lai."
          />
        ) : (
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">
                Đã duyệt ({approved.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Chờ duyệt ({pending.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Từ chối ({rejected.length})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Ngưng ({inactive.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              {approved.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Chưa có yêu cầu khách vãng lai nào được duyệt.
                </p>
              ) : (
                <Table>
                  {tableHeader()}
                  <TableBody>{approved.map(renderGuestRow)}</TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              {pending.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Không có yêu cầu nào đang chờ duyệt.
                </p>
              ) : (
                <Table>
                  {tableHeader()}
                  <TableBody>{pending.map(renderGuestRow)}</TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-4">
              {rejected.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Không có yêu cầu nào bị từ chối.
                </p>
              ) : (
                <Table>
                  {tableHeader(false)}
                  <TableBody>{rejected.map(renderGuestRow)}</TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="inactive" className="mt-4">
              {inactive.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Không có yêu cầu khách vãng lai nào ngưng hoạt động.
                </p>
              ) : (
                <Table>
                  {tableHeader(false)}
                  <TableBody>{inactive.map(renderGuestRow)}</TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      <CreateGuestMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
      />
      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy yêu cầu</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Bạn có chắc muốn hủy yêu cầu này?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (selectedGuestId) {
                  await handleCancel(selectedGuestId)
                }
                setConfirmOpen(false)
                setSelectedGuestId(null)
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
