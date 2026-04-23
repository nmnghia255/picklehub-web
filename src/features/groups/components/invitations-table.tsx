"use client"

import { ChevronDown, ChevronUp, Loader2, Trash2 } from "lucide-react"
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

function getStatusClasses(status: string): string {
  const normalized = status.toLowerCase()

  if (normalized === "pending") {
    return "text-amber-600"
  }

  if (normalized === "accepted") {
    return "text-emerald-600"
  }

  if (
    normalized === "revoked" ||
    normalized === "declined" ||
    normalized === "expired"
  ) {
    return "text-rose-600"
  }

  return "text-muted-foreground"
}

export function InvitationsTable({
  groupId,
  initialInvitations,
}: InvitationsTableProps) {
  const [invitations, setInvitations] =
    useState<Invitation[]>(initialInvitations)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [isListVisible, setIsListVisible] = useState(true)

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

  const pendingCount = invitations.filter(
    (invitation) => invitation.status === "pending"
  ).length

  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Lời mời</h3>
          {!isListVisible && (
            <span className="text-sm text-muted-foreground">
              ({pendingCount} chờ phản hồi)
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setIsListVisible((prev) => !prev)}
          aria-expanded={isListVisible}
          aria-label={
            isListVisible ? "Ẩn danh sách lời mời" : "Hiện danh sách lời mời"
          }
        >
          {isListVisible ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isListVisible
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Email</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hết hạn</TableHead>
                  <TableHead className="w-10 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="pl-4">{invitation.email}</TableCell>
                    <TableCell>
                      <span
                        className={`font-medium capitalize ${getStatusClasses(invitation.status)}`}
                      >
                        {invitation.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invitation.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invitation.expiresAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
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
          </div>
        </div>
      </div>
    </div>
  )
}
