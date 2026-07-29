"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, MoreHorizontal, Search } from "lucide-react"
import React, { useState } from "react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { verifyPaymentAction } from "@/features/socials/actions/payment-actions"
import { listSocialParticipantsAction } from "@/features/socials/actions/social-participant-actions"
import {
  getEffectiveAmountDue,
  getPaymentStatusLabel,
  isInactiveSocialParticipantStatus,
} from "@/features/socials/utils"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd, getPaymentStatusTone } from "@/utils/expense-utils"

import type { PaymentStatus } from "../../../types/payment"
import type { SocialParticipant } from "../../../types/social"
import { ParticipantDetailDialog } from "./participant-detail-dialog"
import { VerifyPaymentDialog } from "./verify-payment-dialog"

export function ParticipantPaymentTrackingCard({
  socialId,
  isCompleted = false,
  initialParticipants,
}: {
  socialId: string
  isCompleted?: boolean
  initialParticipants: SocialParticipant[]
}) {
  const { t } = useSocialsTranslation()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [paymentFilter, setPaymentFilter] = React.useState<
    "all" | PaymentStatus
  >("all")

  // Dialog states
  const [verifyPaymentOpen, setVerifyPaymentOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const [selectedParticipant, setSelectedParticipant] =
    useState<SocialParticipant | null>(null)

  const { data: participants = initialParticipants } = useQuery({
    queryKey: ["socialParticipants", socialId],
    queryFn: () => listSocialParticipantsAction(socialId),
    initialData: initialParticipants,
    enabled: !!socialId,
  })

  const filteredParticipants = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return participants.filter((row) => {
      // Ignore cancelled participants
      if (isInactiveSocialParticipantStatus(row.status)) return false

      const name = row.user.name || ""
      const matchesSearch =
        !normalizedSearch ||
        name.toLowerCase().includes(normalizedSearch) ||
        row.id.toLowerCase().includes(normalizedSearch)
      const matchesFilter =
        paymentFilter === "all" ||
        (paymentFilter === "PAID"
          ? row.paymentStatus === "PAID"
          : paymentFilter === "UNPAID"
            ? row.paymentStatus === "UNPAID"
            : row.paymentStatus === paymentFilter)

      return matchesSearch && matchesFilter
    })
  }, [participants, paymentFilter, searchTerm])

  const queryClient = useQueryClient()

  const handleQuickVerify = async (
    participantId: string,
    action: "PAID" | "WAIVE"
  ) => {
    try {
      await verifyPaymentAction(socialId, participantId, action)
      const successMessage =
        action === "PAID"
          ? t("payment.actions.markPaidSuccess")
          : t("payment.actions.markWaivedSuccess")
      toast.success(successMessage)
      queryClient.invalidateQueries({
        queryKey: ["socialParticipants", socialId],
      })
      queryClient.invalidateQueries({ queryKey: ["financeSummary", socialId] })
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : t("payment.actions.actionFailed")
      toast.error(errMsg)
    }
  }

  const openVerifyPayment = (p: SocialParticipant) => {
    setSelectedParticipant(p)
    setVerifyPaymentOpen(true)
  }

  return (
    <>
      <Card className="gap-0 overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-xl">
                {t("expenses.tracking.title")}
              </CardTitle>
              <CardDescription className="mt-1">
                {t("expenses.tracking.description")}
              </CardDescription>
            </div>
          </div>

          <div className="grid gap-3 pt-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("expenses.tracking.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={paymentFilter}
              onValueChange={(val) =>
                setPaymentFilter(val as "all" | PaymentStatus)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("expenses.tracking.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("expenses.tracking.allStatuses")}
                </SelectItem>
                <SelectItem value="UNPAID">
                  {t("expenses.tracking.unpaid")}
                </SelectItem>
                <SelectItem value="PENDING_REVIEW">
                  {t("expenses.tracking.pendingReview")}
                </SelectItem>
                <SelectItem value="PAID">
                  {t("expenses.tracking.paid")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6 py-3.5">
                    {t("expenses.tracking.headers.participant")}
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-right">
                    {t("expenses.tracking.headers.totalFee")}
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-right">
                    {t("expenses.tracking.headers.amountPaid")}
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-right">
                    {t("expenses.tracking.headers.amountDue")}
                  </TableHead>
                  <TableHead className="px-6 py-3.5">
                    {t("expenses.tracking.headers.status")}
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-right">
                    {t("expenses.tracking.headers.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((row) => {
                    const statusStr = String(row.paymentStatus)
                    const isPaidOrWaived =
                      statusStr === "PAID" || statusStr === "WAIVED"
                    const isPendingReview = statusStr === "PENDING_REVIEW"
                    const hasActions = !isPaidOrWaived || isPendingReview
                    const effectiveDue = Math.max(0, getEffectiveAmountDue(row))

                    return (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer transition-colors hover:bg-muted/40"
                        onClick={() => {
                          setSelectedParticipant(row)
                          setDetailDialogOpen(true)
                        }}
                      >
                        <TableCell className="px-6 py-4">
                          <div className="font-medium text-foreground">
                            {row.user.name || row.user.email}
                          </div>
                          {row.isHost && (
                            <Badge
                              variant="outline"
                              className="mt-1 text-[10px]"
                            >
                              Host
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right font-medium">
                          {formatCurrencyVnd(row.totalFee)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">
                          {formatCurrencyVnd(row.amountPaid)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right font-medium">
                          <span
                            className={
                              effectiveDue > 0
                                ? "text-destructive"
                                : "text-muted-foreground"
                            }
                          >
                            {formatCurrencyVnd(effectiveDue)}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {isPendingReview ? (
                            <Badge
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation()
                                openVerifyPayment(row)
                              }}
                              className="cursor-pointer border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
                            >
                              <Check className="mr-1 size-3" />
                              {t("payment.actions.verifyPending")}
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className={getPaymentStatusTone(
                                row.paymentStatus
                              )}
                            >
                              {getPaymentStatusLabel(row.paymentStatus, t)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell
                          className="px-6 py-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {hasActions ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="size-8 p-0">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                {isPendingReview && (
                                  <DropdownMenuItem
                                    onClick={() => openVerifyPayment(row)}
                                  >
                                    {t("payment.actions.verifyPending")}
                                  </DropdownMenuItem>
                                )}

                                {!isPaidOrWaived && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleQuickVerify(row.id, "PAID")
                                      }
                                    >
                                      {t("payment.actions.markPaid")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleQuickVerify(row.id, "WAIVE")
                                      }
                                    >
                                      {t("payment.actions.markWaived")}
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-muted-foreground">
                        <Search className="size-10 text-muted-foreground/60" />
                        <p className="font-medium text-foreground">
                          {t("expenses.tracking.emptyTitle")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedParticipant && (
        <>
          <VerifyPaymentDialog
            socialId={socialId}
            participantId={selectedParticipant.id}
            participantName={
              selectedParticipant.user.name || selectedParticipant.user.email
            }
            receiptUrl={selectedParticipant.receiptUrls?.at(-1) ?? undefined}
            amountDue={Math.max(0, getEffectiveAmountDue(selectedParticipant))}
            open={verifyPaymentOpen}
            onOpenChange={setVerifyPaymentOpen}
          />
          <ParticipantDetailDialog
            socialId={socialId}
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            participant={selectedParticipant}
          />
        </>
      )}
    </>
  )
}
