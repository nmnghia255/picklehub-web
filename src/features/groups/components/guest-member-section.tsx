"use client"

import { useState } from "react"

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

import { initialMockGuestMembers } from "../mock-data/guest-members"
import type { GuestMember } from "../types/guest-member"
import { CreateGuestMemberDialog } from "./create-guest-member-dialog"

function formatDate(value: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatGender(value: string | null) {
  if (value === "MALE") return "Nam"
  if (value === "FEMALE") return "Nữ"
  if (value === "OTHER") return "Khác"
  return "-"
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
  const [requests, setRequests] = useState<GuestMember[]>(
    initialMockGuestMembers.filter((g) => g.groupId === groupId)
  )
  const [dialogOpen, setDialogOpen] = useState(false)

  const normalizedRole = currentUserRole?.toLowerCase()
  const isOwner = normalizedRole === "owner"

  const pending = requests.filter((r) => r.status === "PENDING")
  const approved = requests.filter((r) => r.status === "APPROVED")
  const rejected = requests.filter((r) => r.status === "REJECTED")

  const handleCreate = (input: {
    fullName: string
    dateOfBirth: string
    gender: "MALE" | "FEMALE" | "OTHER" | null
    selfRating: number
    note: string
  }) => {
    const newRequest: GuestMember = {
      id: `guest-${Date.now()}`,
      ...input,
      status: "PENDING",
      responsibleMemberId: currentUserId,
      responsibleMemberName: "Bạn",
      groupId,
      createdAt: new Date().toISOString(),
      approvedAt: null,
      rejectedAt: null,
    }
    setRequests((prev) => [newRequest, ...prev])
  }

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "APPROVED" as const,
              approvedAt: new Date().toISOString(),
            }
          : r
      )
    )
  }

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "REJECTED" as const,
              rejectedAt: new Date().toISOString(),
            }
          : r
      )
    )
  }

  const renderGuestRow = (guest: GuestMember) => (
    <TableRow key={guest.id}>
      <TableCell className="font-medium">{guest.fullName}</TableCell>
      <TableCell>{formatDate(guest.dateOfBirth)}</TableCell>
      <TableCell>{formatGender(guest.gender)}</TableCell>
      <TableCell>{guest.selfRating.toFixed(1)}</TableCell>
      <TableCell>{guest.note || "-"}</TableCell>
      <TableCell>{guest.responsibleMemberName}</TableCell>
      <TableCell>
        {guest.status === "PENDING" && (
          <Badge variant="secondary">Chờ duyệt</Badge>
        )}
        {guest.status === "APPROVED" && (
          <Badge variant="default">Đã duyệt</Badge>
        )}
        {guest.status === "REJECTED" && (
          <Badge variant="destructive">Từ chối</Badge>
        )}
      </TableCell>
      {isOwner && guest.status === "PENDING" && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleApprove(guest.id)}
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
    </TableRow>
  )

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Người vãng lai</CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            Gửi yêu cầu
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            Chưa có người vãng lai nào.
          </p>
        ) : (
          <Tabs defaultValue="approved">
            <TabsList>
              <TabsTrigger value="approved">
                Đã duyệt ({approved.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Chờ duyệt ({pending.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Từ chối ({rejected.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="approved" className="mt-4">
              {approved.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  Chưa có người vãng lai nào được duyệt.
                </p>
              ) : (
                <Table>
                  <colgroup>
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "12%" }} />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Ngày sinh</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>Người chịu trách nhiệm</TableHead>
                      <TableHead>Trạng thái</TableHead>
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
                  <colgroup>
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "10%" }} />
                    {isOwner && <col style={{ width: "14%" }} />}
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Ngày sinh</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>Người chịu trách nhiệm</TableHead>
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
                  <colgroup>
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "12%" }} />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Ngày sinh</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>Người chịu trách nhiệm</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{rejected.map(renderGuestRow)}</TableBody>
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
