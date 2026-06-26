"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { ErrorSection } from "@/components/error-section"
import { Badge } from "@/components/ui/badge"
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
  deactivateGuestClient,
  guestQueryKeys,
  listGuestsClient,
} from "../api/guests-client"
import type { Guest } from "../types/guest-member"
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

function formatGender(value: string | null | undefined) {
  if (value === "MALE") return "Nam"
  if (value === "FEMALE") return "Nữ"
  return "-"
}

function formatSkillLevel(value: string | null | undefined) {
  if (value === "BEGINNER") return "Mới bắt đầu"
  if (value === "INTERMEDIATE") return "Trung bình"
  if (value === "ADVANCED") return "Khá"
  if (value === "EXPERT") return "Chuyên nghiệp"
  return value ?? "-"
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

  const normalizedRole = currentUserRole?.toLowerCase()
  const isOwner = normalizedRole === "owner"

  const guestsQuery = useQuery({
    queryKey: guestQueryKeys.list(groupId, { limit: 100 }),
    queryFn: () => listGuestsClient(groupId, { limit: 100 }),
  })

  const pending = (guestsQuery.data ?? []).filter(
    (g) => g.status === "PENDING_APPROVAL"
  )
  const approved = (guestsQuery.data ?? []).filter((g) => g.status === "ACTIVE")
  const rejected = (guestsQuery.data ?? []).filter(
    (g) => g.status === "REJECTED"
  )
  const inactive = (guestsQuery.data ?? []).filter(
    (g) => g.status === "INACTIVE"
  )

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: guestQueryKeys.all(groupId) })

  const handleCreate = async (input: {
    name: string
    email: string
    skillLevel: string
    phone?: string
    gender?: "MALE" | "FEMALE"
  }) => {
    try {
      await createGuestClient(groupId, input)
      toast.success("Đã gửi yêu cầu người vãng lai.")
      await invalidate()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể tạo khách vãng lai."
      )
    }
  }

  const handleApprove = async () => {
    const ids = pending.map((g) => g.id)
    if (ids.length === 0) return
    try {
      await approveGuestsClient(groupId, { guestIds: ids, status: "ACTIVE" })
      toast.success("Đã duyệt tất cả khách vãng lai.")
      await invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể duyệt.")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await approveGuestsClient(groupId, { guestIds: [id], status: "REJECTED" })
      toast.success("Đã từ chối khách vãng lai.")
      await invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể từ chối.")
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateGuestClient(groupId, id)
      toast.success("Đã hủy kích hoạt khách vãng lai.")
      await invalidate()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể hủy kích hoạt."
      )
    }
  }

  const renderGuestRow = (guest: Guest) => (
    <TableRow key={guest.id}>
      <TableCell className="font-medium">{guest.name}</TableCell>
      <TableCell>{guest.email}</TableCell>
      <TableCell>{formatSkillLevel(guest.skillLevel)}</TableCell>
      <TableCell>{formatGender(guest.gender)}</TableCell>
      <TableCell>{guest.phone || "-"}</TableCell>
      <TableCell>{guest.invitedBy?.name || "-"}</TableCell>
      <TableCell>
        {guest.status === "PENDING_APPROVAL" && (
          <Badge variant="secondary">Chờ duyệt</Badge>
        )}
        {guest.status === "ACTIVE" && <Badge variant="default">Đã duyệt</Badge>}
        {guest.status === "REJECTED" && (
          <Badge variant="destructive">Từ chối</Badge>
        )}
        {guest.status === "INACTIVE" && (
          <Badge variant="outline">Ngưng hoạt động</Badge>
        )}
      </TableCell>
      {isOwner && guest.status === "PENDING_APPROVAL" && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                void approveGuestsClient(groupId, {
                  guestIds: [guest.id],
                  status: "ACTIVE",
                }).then(() => {
                  toast.success("Đã duyệt khách vãng lai.")
                  void invalidate()
                })
              }}
            >
              Duyệt
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(guest.id)}
            >
              Từ chối
            </Button>
          </div>
        </TableCell>
      )}
      {guest.status === "ACTIVE" && isOwner && (
        <TableCell className="text-right">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeactivate(guest.id)}
          >
            Hủy kích hoạt
          </Button>
        </TableCell>
      )}
    </TableRow>
  )

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Người vãng lai</CardTitle>
          <div className="flex gap-2">
            {isOwner && pending.length > 0 && (
              <Button size="sm" variant="default" onClick={handleApprove}>
                Duyệt tất cả ({pending.length})
              </Button>
            )}
            <Button size="sm" onClick={() => setDialogOpen(true)}>
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
                  Chưa có người vãng lai nào được duyệt.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Trình độ</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>SĐT</TableHead>
                      <TableHead>Người mời</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      {isOwner && <TableHead />}
                    </TableRow>
                  </TableHeader>
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
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Trình độ</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>SĐT</TableHead>
                      <TableHead>Người mời</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      {isOwner && (
                        <TableHead className="text-right">Thao tác</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
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
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Trình độ</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>SĐT</TableHead>
                      <TableHead>Người mời</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{rejected.map(renderGuestRow)}</TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="inactive" className="mt-4">
              {inactive.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Không có người vãng lai nào ngưng hoạt động.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Trình độ</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>SĐT</TableHead>
                      <TableHead>Người mời</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
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
    </Card>
  )
}
