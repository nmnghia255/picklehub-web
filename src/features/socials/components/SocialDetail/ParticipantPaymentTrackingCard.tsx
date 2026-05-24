"use client"

import { Search } from "lucide-react"
import React from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatVnd, getPaymentStatusTone } from "@/utils/expense-utils"

import type {
  ParticipantPaymentRow,
  PaymentStatus,
} from "../../mock-data/expense-types"

export function ParticipantPaymentTrackingCard({
  participants,
}: {
  participants: ParticipantPaymentRow[]
}) {
  const { t } = useSocialsTranslation()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [paymentFilter, setPaymentFilter] = React.useState<
    "all" | PaymentStatus
  >("all")

  const filteredParticipants = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return participants.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        row.participant.toLowerCase().includes(normalizedSearch) ||
        row.id.toLowerCase().includes(normalizedSearch)
      const matchesFilter =
        paymentFilter === "all" || row.paymentStatus === paymentFilter

      return matchesSearch && matchesFilter
    })
  }, [participants, paymentFilter, searchTerm])

  return (
    <Card className="overflow-hidden">
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
          {/* <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {t("expenses.tracking.results", {
                count: filteredParticipants.length,
              })}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {t("expenses.tracking.stickyHeaderEnabled")}
            </Badge>
          </div> */}
        </div>

        <div className="grid gap-3 pt-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t("expenses.tracking.searchPlaceholder")}
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
                {t("expenses.tracking.allStatuses")}
              </SelectItem>
              <SelectItem value="paid">
                {t("expenses.tracking.paid")}
              </SelectItem>
              <SelectItem value="unpaid">
                {t("expenses.tracking.unpaid")}
              </SelectItem>
              <SelectItem value="refunded">
                {t("expenses.tracking.refunded")}
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
                  {t("expenses.tracking.headers.participant")}
                </TableHead>
                <TableHead className="px-6 py-4">
                  {t("expenses.tracking.headers.status")}
                </TableHead>
                <TableHead className="px-6 py-4">
                  {t("expenses.tracking.headers.amountDue")}
                </TableHead>
                <TableHead className="px-6 py-4 text-right">
                  {t("expenses.tracking.headers.paymentStatus")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.length ? (
                filteredParticipants.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="px-6 py-4 font-medium">
                      {row.participant}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant="secondary">
                        {t(
                          `expenses.tracking.participantStatus.${row.participantStatus.toLowerCase()}`
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      {formatVnd(row.amountDue)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Badge
                        className={getPaymentStatusTone(row.paymentStatus)}
                      >
                        {t(`expenses.tracking.${row.paymentStatus}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-muted-foreground">
                      <Search className="size-10 text-muted-foreground/60" />
                      <p className="font-medium text-foreground">
                        {t("expenses.tracking.emptyTitle")}
                      </p>
                      <p className="text-sm">
                        {t("expenses.tracking.emptyDescription")}
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
  )
}
