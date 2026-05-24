"use client"

import { CalendarDays, ReceiptText, ShieldCheck, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCourtCreditsTranslation } from "@/i18n/use-court-credits-translation"
import { cn } from "@/lib/utils"

import type { CreditRecord } from "../../credit-management/court-credits-data"
import {
  formatCreditDate,
  formatCurrencyVnd,
} from "../../credit-management/court-credits-data"
import { ReasonBadge } from "./Badges"
import CreditActionsDropdown from "./CreditActionsDropdown"

export function CreditCardMobile({
  credit,
  onView,
  onOpen,
  onCancelCredit,
  onCreateManualCredit,
}: {
  credit: CreditRecord
  onView: (credit: CreditRecord) => void
  onOpen: (credit: CreditRecord) => void
  onCancelCredit: (credit: CreditRecord) => void
  onCreateManualCredit: (credit: CreditRecord) => void
}) {
  const { t, i18n } = useCourtCreditsTranslation()

  return (
    <Card
      className={cn(
        "overflow-hidden border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      )}
      onClick={() => onOpen(credit)}
    >
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{credit.id}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserRound className="size-4" />
              {credit.customerName}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-muted/30 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {t("mobile.created")}
            </div>
            <p className="font-medium">
              {formatCreditDate(credit.createdAt, i18n.language)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("mobile.booking", { bookingId: credit.originalBookingId })}
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <ReceiptText className="size-3.5" />
              {t("mobile.balance")}
            </div>
            <p className="font-medium">
              {formatCurrencyVnd(credit.remainingAmount)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("mobile.original", {
                amount: formatCurrencyVnd(credit.creditAmount),
              })}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-muted/30 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              {t("mobile.reason")}
            </div>
            <ReasonBadge reason={credit.cancellationReason} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{credit.bookingCode}</Badge>
          <Badge variant="outline">
            {t("mobile.remaining", {
              amount: formatCurrencyVnd(credit.remainingAmount),
            })}
          </Badge>
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onView(credit)}
          >
            {t("actions.viewDetails")}
          </Button>
          <CreditActionsDropdown
            credit={credit}
            onView={onView}
            onCancelCredit={onCancelCredit}
            onCreateManualCredit={onCreateManualCredit}
          />
        </div>
      </CardContent>
    </Card>
  )
}
