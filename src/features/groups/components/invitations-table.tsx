"use client"

import { Loader2, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { revokeInvitationAction } from "../actions"
import type { Invitation } from "../types"

interface InvitationsTableProps {
  groupId: string
  initialInvitations: Invitation[]
}

export function InvitationsTable({
  groupId,
  initialInvitations,
}: InvitationsTableProps) {
  const [invitations, setInvitations] =
    useState<Invitation[]>(initialInvitations)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  useEffect(() => {
    setInvitations(initialInvitations)
  }, [initialInvitations])

  const handleRevoke = async (invitationId: string) => {
    setRevokingId(invitationId)
    const result = await revokeInvitationAction(groupId, invitationId)
    setRevokingId(null)
    if (result.success) {
      toast.success("Đã thu hồi lời mời.")
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status: "revoked" } : inv
        )
      )
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Ngày tạo</TableHead>
          <TableHead>Hết hạn</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => (
          <TableRow key={invitation.id}>
            <TableCell>{invitation.email}</TableCell>
            <TableCell className="capitalize">{invitation.status}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(invitation.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(invitation.expiresAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </TableCell>
            <TableCell className="text-right">
              {invitation.status === "pending" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  disabled={revokingId === invitation.id}
                  onClick={() => handleRevoke(invitation.id)}
                  aria-label="Thu hồi lời mời"
                >
                  {revokingId === invitation.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
