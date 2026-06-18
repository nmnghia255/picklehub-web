"use client"

import { useQuery } from "@tanstack/react-query"
import { Check, HandCoins, MoreHorizontal, Search, Undo } from "lucide-react"
import React, { useState } from "react"

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { listSocialParticipantsAction } from "@/features/socials/actions/social-participant-actions"
import { getPaymentStatusLabel } from "@/features/socials/utils"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd, getPaymentStatusTone } from "@/utils/expense-utils"

import type { PaymentStatus } from "../../../types/payment"
import type { SocialParticipant } from "../../../types/social"
import { ParticipantDetailDialog } from "./participant-detail-dialog"
import { RecordPaymentDialog } from "./record-payment-dialog"
import { RefundDialog } from "./refund-dialog"
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
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false)
  const [verifyPaymentOpen, setVerifyPaymentOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const [selectedParticipant, setSelectedParticipant] =
    useState<SocialParticipant | null>(null)

  const participants = initialParticipants

  const filteredParticipants = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return participants.filter((row) => {
      const name = row.user.name || ""
      const matchesSearch =
        !normalizedSearch ||
        name.toLowerCase().includes(normalizedSearch) ||
        row.id.toLowerCase().includes(normalizedSearch)
      const matchesFilter =
        paymentFilter === "all" || row.paymentStatus === paymentFilter

      return matchesSearch && matchesFilter
    })
  }, [participants, paymentFilter, searchTerm])

  const openRecordPayment = (p: SocialParticipant) => {
    setSelectedParticipant(p)
    setRecordPaymentOpen(true)
  }

  const openVerifyPayment = (p: SocialParticipant) => {
    setSelectedParticipant(p)
    setVerifyPaymentOpen(true)
  }

  const openRefund = (p: SocialParticipant) => {
    setSelectedParticipant(p)
    setRefundOpen(true)
  }

  // Get the latest payment for verification if any
  const latestPayment = selectedParticipant?.payments?.[0]

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-xl">
                {t("expenses.tracking.title", {
                  defaultValue: "Payment Tracking",
                })}
              </CardTitle>
              <CardDescription className="mt-1">
                {t("expenses.tracking.description", {
                  defaultValue: "Track participant payments and due amounts",
                })}
              </CardDescription>
            </div>
          </div>

          <div className="grid gap-3 pt-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={t("expenses.tracking.searchPlaceholder", {
                  defaultValue: "Search participants...",
                })}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <Select
              value={paymentFilter}
              onValueChange={(value) =>
                setPaymentFilter(value as "all" | PaymentStatus)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("expenses.tracking.filterPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("expenses.tracking.allStatuses", {
                    defaultValue: "All Statuses",
                  })}
                </SelectItem>
                <SelectItem value="PAID">
                  {getPaymentStatusLabel("PAID", t)}
                </SelectItem>
                <SelectItem value="UNPAID">
                  {getPaymentStatusLabel("UNPAID", t)}
                </SelectItem>
                <SelectItem value="PARTIALLY_PAID">
                  {getPaymentStatusLabel("PARTIALLY_PAID", t)}
                </SelectItem>
                <SelectItem value="OVERPAID">
                  {getPaymentStatusLabel("OVERPAID", t)}
                </SelectItem>
                <SelectItem value="REFUNDED">
                  {getPaymentStatusLabel("REFUNDED", t)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-110 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
                <TableRow>
                  <TableHead className="px-6 py-4">
                    {t("expenses.tracking.headers.participant", {
                      defaultValue: "Participant",
                    })}
                  </TableHead>
                  <TableHead className="px-6 py-4">
                    {t("expenses.tracking.headers.totalFee", {
                      defaultValue: "Total Fee",
                    })}
                  </TableHead>
                  <TableHead className="px-6 py-4">
                    {t("expenses.tracking.headers.amountDue", {
                      defaultValue: "Amount Due",
                    })}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-center">
                    {t("expenses.tracking.headers.status", {
                      defaultValue: "Status",
                    })}
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right">
                    {t("expenses.tracking.headers.actions", {
                      defaultValue: "Actions",
                    })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length ? (
                  filteredParticipants.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => {
                        setSelectedParticipant(row)
                        setDetailDialogOpen(true)
                      }}
                    >
                      <TableCell className="px-6 py-4 font-medium">
                        {row.user.name || "Unknown"}
                        {row.isHost && (
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            Host
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">
                        {formatCurrencyVnd(row.totalFee)}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-destructive">
                        {row.amountDue > 0 ? (
                          formatCurrencyVnd(row.amountDue)
                        ) : row.amountDue < 0 ? (
                          <span className="text-emerald-600">
                            Credit: {formatCurrencyVnd(Math.abs(row.amountDue))}
                          </span>
                        ) : (
                          "0"
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Badge
                            className={getPaymentStatusTone(row.paymentStatus)}
                          >
                            {getPaymentStatusLabel(row.paymentStatus, t)}
                          </Badge>
                          {row.payments?.[0]?.receiptUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openVerifyPayment(row)
                              }}
                              disabled={isCompleted}
                              className="group relative flex h-7 w-6 items-center justify-center overflow-hidden rounded-[4px] border border-border/50 bg-muted/50 shadow-xs transition-colors hover:border-primary/50 disabled:pointer-events-none disabled:opacity-50"
                              title={t("expenses.tracking.viewReceipt", {
                                defaultValue: "View Receipt",
                              })}
                            >
                              <img
                                src={row.payments[0].receiptUrl}
                                alt="Receipt"
                                className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                              />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="size-8 p-0"
                              disabled={isCompleted}
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              {t("expenses.tracking.actions.actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openVerifyPayment(row)}
                            >
                              <Check className="mr-2 size-4" />
                              {t("expenses.tracking.actions.verifyReceipt", {
                                defaultValue: "Verify Receipt",
                              })}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openRecordPayment(row)}
                            >
                              <HandCoins className="mr-2 size-4" />
                              {t("expenses.tracking.actions.recordCash", {
                                defaultValue: "Record Cash",
                              })}
                            </DropdownMenuItem>
                            {row.amountDue < 0 && (
                              <DropdownMenuItem onClick={() => openRefund(row)}>
                                <Undo className="mr-2 size-4" />
                                {t("expenses.tracking.actions.issueRefund", {
                                  defaultValue: "Issue Refund",
                                })}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-muted-foreground">
                        <Search className="size-10 text-muted-foreground/60" />
                        <p className="font-medium text-foreground">
                          {t("expenses.tracking.emptyTitle", {
                            defaultValue: "No participants found",
                          })}
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
          <RecordPaymentDialog
            socialId={socialId}
            participantId={selectedParticipant.id}
            open={recordPaymentOpen}
            onOpenChange={setRecordPaymentOpen}
            defaultAmount={
              selectedParticipant.amountDue > 0
                ? selectedParticipant.amountDue
                : 0
            }
          />
          <VerifyPaymentDialog
            socialId={socialId}
            participantId={selectedParticipant.id}
            paymentId={latestPayment?.id || ""}
            receiptUrl={latestPayment?.receiptUrl}
            amountDue={selectedParticipant.amountDue}
            open={verifyPaymentOpen}
            onOpenChange={setVerifyPaymentOpen}
          />
          <RefundDialog
            socialId={socialId}
            participantId={selectedParticipant.id}
            maxRefundAmount={Math.abs(selectedParticipant.amountDue)}
            open={refundOpen}
            onOpenChange={setRefundOpen}
          />
          <ParticipantDetailDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            participant={selectedParticipant}
            onVerify={() => {
              setDetailDialogOpen(false)
              openVerifyPayment(selectedParticipant)
            }}
            onRecordCash={() => {
              setDetailDialogOpen(false)
              openRecordPayment(selectedParticipant)
            }}
            onRefund={() => {
              setDetailDialogOpen(false)
              openRefund(selectedParticipant)
            }}
          />
        </>
      )}
    </>
  )
}
