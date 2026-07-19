"use client"

import { useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronUp, Loader2, Mail, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import { revokeInvitationAction } from "../../actions"
import {
  getGroupInvitationsClient,
  groupQueryKeys,
  useGroupInvalidation,
  useSyncGroupData,
} from "../../api/groups-client"
import type { Invitation } from "../../types"

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
  const { t } = useGroupsTranslation()
  const invalidation = useGroupInvalidation(groupId)
  const queryKey = groupQueryKeys.invitations(groupId)
  useSyncGroupData(queryKey, initialInvitations)

  const { data: invitations = [] } = useQuery({
    queryKey,
    queryFn: () => getGroupInvitationsClient(groupId),
    initialData: initialInvitations,
  })

  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [isListVisible, setIsListVisible] = useState(true)
  const [invitationToRevoke, setInvitationToRevoke] =
    useState<Invitation | null>(null)

  const handleRevoke = async (invitationId: string) => {
    setRevokingId(invitationId)
    const result = await revokeInvitationAction(groupId, invitationId)
    setRevokingId(null)
    if (result.success) {
      toast.success(t("errors.revokeInvitationSuccess", "Đã thu hồi lời mời."))
      void invalidation.invalidateInvitations()
    } else if (result.error) {
      toast.error(t(result.error, result.error))
    }
  }

  const pendingCount = invitations.filter(
    (invitation) => invitation.status === "pending"
  ).length

  const handleConfirmRevoke = async () => {
    if (!invitationToRevoke) return

    const invitationId = invitationToRevoke.id
    setInvitationToRevoke(null)
    await handleRevoke(invitationId)
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-base" />
          <h3 className="text-lg font-semibold">
            {t("dashboard.invitationsLabel", "Lời mời")}
          </h3>
          {!isListVisible && (
            <span className="text-sm text-muted-foreground">
              (
              {t("dashboard.pendingCountLabel", "{{count}} pending", {
                count: pendingCount,
              })}
              )
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
            isListVisible
              ? t("dashboard.hideInvitationsList", "Ẩn danh sách lời mời")
              : t("dashboard.showInvitationsList", "Hiện danh sách lời mời")
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
                  <TableHead className="w-[35%] pl-4">Email</TableHead>
                  <TableHead>{t("activitySchedule.thStatus")}</TableHead>
                  <TableHead>{t("dashboard.createdAtLabel")}</TableHead>
                  <TableHead>{t("dashboard.thExpiresAt", "Hết hạn")}</TableHead>
                  <TableHead className="w-14 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="w-[35%] pl-4 font-medium">
                      <div className="truncate">{invitation.email}</div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium capitalize ${getStatusClasses(invitation.status)}`}
                      >
                        {t(
                          `invitationStatuses.${invitation.status}`,
                          invitation.status
                        )}
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
                    <TableCell className="pr-6 text-right">
                      {invitation.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          disabled={revokingId === invitation.id}
                          onClick={() => setInvitationToRevoke(invitation)}
                          aria-label={t(
                            "dashboard.revokeInvitationAction",
                            "Thu hồi lời mời"
                          )}
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
                {!invitations.length && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-4 text-center text-muted-foreground"
                    >
                      {t("dashboard.noInvitations", "Chưa có lời mời nào.")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog
        open={invitationToRevoke !== null}
        onOpenChange={(open) => {
          if (!open) {
            setInvitationToRevoke(null)
          }
        }}
      >
        <DialogContent className="group-feature-root">
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.revokeInvitationDialogTitle", "Thu hồi lời mời")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "dashboard.revokeInvitationDialogDesc",
                "Bạn có chắc muốn thu hồi lời mời gửi tới {{email}} không? Thao tác này sẽ thay đổi trạng thái lời mời sang đã thu hồi.",
                { email: invitationToRevoke?.email }
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter showCloseButton={false} className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setInvitationToRevoke(null)}
              disabled={revokingId !== null}
            >
              {t("activitySchedule.btnNo", "Không")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmRevoke}
              disabled={revokingId !== null}
            >
              {t("dashboard.btnRevoke", "Có, thu hồi")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
