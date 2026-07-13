"use client"

import { Calendar, Clock, Mail, RefreshCw, Trash2, XCircle } from "lucide-react"
import { useEffect, useTransition } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { usePersonnelStore } from "../../stores/use-personnel-store"

export function RefereeInvitationsList({
  isEditable,
}: {
  isEditable: boolean
}) {
  const { t } = useTournamentTranslation()
  const [isPending, startTransition] = useTransition()

  // Store Hooks
  const invitations = usePersonnelStore((s) => s.invitations)
  const isLoadingInvitations = usePersonnelStore((s) => s.isLoadingInvitations)
  const fetchInvitations = usePersonnelStore((s) => s.fetchInvitations)
  const revokeInvitation = usePersonnelStore((s) => s.revokeInvitation)

  // Fetch on mount
  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  const handleRevoke = async (id: number, email: string) => {
    if (
      !confirm(
        t("personnel.invitations.revokeConfirm", {
          defaultValue: `Are you sure you want to revoke the invitation sent to ${email}?`,
          email,
        })
      )
    ) {
      return
    }

    startTransition(async () => {
      const res = await revokeInvitation(id)
      if (res.success) {
        toast.success(
          t("personnel.invitations.revokeSuccess", {
            defaultValue: "Invitation revoked successfully",
          })
        )
      } else {
        toast.error(res.error || "Failed to revoke invitation")
      }
    })
  }

  const getStatusBadge = (
    status: "PENDING" | "ACCEPTED" | "REVOKED" | string
  ) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="flex w-fit items-center gap-1.5 border-amber-200 bg-amber-50 font-semibold text-amber-700"
          >
            <Clock className="h-3 w-3" />
            {t("personnel.invitations.status.pending", {
              defaultValue: "Pending",
            })}
          </Badge>
        )
      case "ACCEPTED":
        return (
          <Badge
            variant="outline"
            className="flex w-fit items-center gap-1.5 border-emerald-200 bg-emerald-50 font-semibold text-emerald-700"
          >
            <Clock className="hidden h-3 w-3" /> {/* Placeholder/Spacing */}
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {t("personnel.invitations.status.accepted", {
              defaultValue: "Accepted",
            })}
          </Badge>
        )
      case "REVOKED":
        return (
          <Badge
            variant="outline"
            className="flex w-fit items-center gap-1.5 border-gray-200 bg-gray-50 font-semibold text-gray-500"
          >
            <XCircle className="h-3 w-3" />
            {t("personnel.invitations.status.revoked", {
              defaultValue: "Revoked",
            })}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Card className="border-gray-150 gap-0 border bg-white py-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Mail className="h-5 w-5 text-emerald-600" />
            {t("personnel.invitations.cardTitle", {
              defaultValue: "Referee Invitations",
            })}
          </CardTitle>
          <CardDescription className="mt-1 text-xs text-gray-500">
            {t("personnel.invitations.cardDescription", {
              defaultValue:
                "Manage email invitations sent to prospective referees.",
            })}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchInvitations}
          disabled={isLoadingInvitations}
          className="border-gray-250 bg-white text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoadingInvitations ? "animate-spin" : ""}`}
          />
          {t("personnel.invitations.refresh", { defaultValue: "Refresh" })}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoadingInvitations && invitations.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">
              {t("personnel.invitations.loading", {
                defaultValue: "Loading invitations...",
              })}
            </span>
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 p-6 text-center">
            <Mail className="h-10 w-10 text-gray-300" />
            <h3 className="text-sm font-semibold text-gray-900">
              {t("personnel.invitations.emptyTitle", {
                defaultValue: "No invitations found",
              })}
            </h3>
            <p className="max-w-sm text-xs text-gray-500">
              {t("personnel.invitations.emptyDesc", {
                defaultValue:
                  "You haven't sent any invitations to referees yet. Click 'Invite' in the roster tab to send one.",
              })}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-600">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    {t("personnel.invitations.table.email", {
                      defaultValue: "Email",
                    })}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t("personnel.invitations.table.status", {
                      defaultValue: "Status",
                    })}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t("personnel.invitations.table.sentAt", {
                      defaultValue: "Sent At",
                    })}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {t("personnel.invitations.table.expiresAt", {
                      defaultValue: "Expires At",
                    })}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    {t("personnel.invitations.table.actions", {
                      defaultValue: "Actions",
                    })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-gray-150 divide-y bg-white">
                {invitations.map((inv) => (
                  <tr
                    key={inv.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4 font-medium whitespace-nowrap text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          <Mail className="h-4 w-4" />
                        </div>
                        <span>{inv.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 text-xs whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(inv.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(inv.expiresAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {inv.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(inv.id, inv.email)}
                          disabled={isPending || !isEditable}
                          className="hover:bg-red-55/10 h-8 rounded-md px-2 text-red-600 transition-colors hover:text-red-700"
                          title={t("personnel.invitations.revoke", {
                            defaultValue: "Revoke invitation",
                          })}
                        >
                          <Trash2 className="mr-1.5 h-4 w-4" />
                          {t("personnel.invitations.revokeBtn", {
                            defaultValue: "Revoke",
                          })}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
