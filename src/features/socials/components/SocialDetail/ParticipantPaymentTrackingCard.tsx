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

import type { ParticipantPaymentRow, PaymentStatus } from "./expense-types"
import { formatVnd, getPaymentStatusTone } from "./expense-utils"

export function ParticipantPaymentTrackingCard({
  participants,
}: {
  participants: ParticipantPaymentRow[]
}) {
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
              Participant Payment Tracking
            </CardTitle>
            <CardDescription className="mt-1">
              Search participants and filter their payment status.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {filteredParticipants.length} results
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              Sticky header enabled
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 pt-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search participant"
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
              <SelectValue placeholder="Filter by payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-110 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
              <TableRow>
                <TableHead className="px-6 py-4">Participant</TableHead>
                <TableHead className="px-6 py-4">Status</TableHead>
                <TableHead className="px-6 py-4">Amount Due</TableHead>
                <TableHead className="px-6 py-4 text-right">
                  Payment Status
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
                      <Badge variant="secondary">{row.participantStatus}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      {formatVnd(row.amountDue)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Badge
                        className={getPaymentStatusTone(row.paymentStatus)}
                      >
                        {row.paymentStatus === "paid"
                          ? "Paid"
                          : row.paymentStatus === "unpaid"
                            ? "Unpaid"
                            : "Refunded"}
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
                        No participants match this filter.
                      </p>
                      <p className="text-sm">
                        Clear the search or switch payment status to see more
                        rows.
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
