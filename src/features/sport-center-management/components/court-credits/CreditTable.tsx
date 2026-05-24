"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCourtCreditsTranslation } from "@/i18n/use-court-credits-translation"
import { cn } from "@/lib/utils"

import type { CreditRecord } from "../../credit-management/court-credits-data"
import {
  formatCreditDate,
  formatCurrencyVnd,
} from "../../credit-management/court-credits-data"
import { ReasonBadge } from "./Badges"
import CreditActionsDropdown from "./CreditActionsDropdown"

export function CreditTable({
  credits,
  onView,
  onRowClick,
  onCancelCredit,
  onCreateManualCredit,
}: {
  credits: CreditRecord[]
  onView: (credit: CreditRecord) => void
  onRowClick: (credit: CreditRecord) => void
  onCancelCredit: (credit: CreditRecord) => void
  onCreateManualCredit: (credit: CreditRecord) => void
}) {
  const { t, i18n } = useCourtCreditsTranslation()

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="max-h-[68vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
            <TableRow>
              <TableHead>{t("table.creditId")}</TableHead>
              <TableHead>{t("table.customer")}</TableHead>
              <TableHead>{t("table.originalBookingId")}</TableHead>
              <TableHead>{t("table.creditAmount")}</TableHead>
              <TableHead>{t("table.remainingAmount")}</TableHead>
              <TableHead>{t("table.createdDate")}</TableHead>
              <TableHead>{t("table.cancellationReason")}</TableHead>
              <TableHead>{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credits.map((credit) => (
              <TableRow
                key={credit.id}
                className={cn(
                  "group cursor-pointer transition-colors hover:bg-accent/50"
                )}
                onClick={() => onRowClick(credit)}
              >
                <TableCell className="font-medium text-foreground">
                  {credit.id}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {credit.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {credit.phone}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{credit.originalBookingId}</Badge>
                </TableCell>
                <TableCell>{formatCurrencyVnd(credit.creditAmount)}</TableCell>
                <TableCell>
                  {formatCurrencyVnd(credit.remainingAmount)}
                </TableCell>
                <TableCell>
                  {formatCreditDate(credit.createdAt, i18n.language)}
                </TableCell>
                <TableCell>
                  <ReasonBadge reason={credit.cancellationReason} />
                </TableCell>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <CreditActionsDropdown
                    credit={credit}
                    onView={onView}
                    onCancelCredit={onCancelCredit}
                    onCreateManualCredit={onCreateManualCredit}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
