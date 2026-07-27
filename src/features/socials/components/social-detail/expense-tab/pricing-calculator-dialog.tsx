"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Calculator, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  applyPriceAction,
  calculateSuggestedPricingAction,
} from "@/features/socials/actions/finance-actions"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

interface PricingCalculatorDialogProps {
  socialId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PricingCalculatorDialog({
  socialId,
  open,
  onOpenChange,
}: PricingCalculatorDialogProps) {
  const { t } = useSocialsTranslation()
  const queryClient = useQueryClient()
  const [targetPlayers, setTargetPlayers] = useState<number>(12)
  const [sessionOverrides, setSessionOverrides] = useState<
    Record<string, number>
  >({})
  const [packageOverride, setPackageOverride] = useState<number | "">("")

  // Debounced values for backend API query to prevent reloading while typing
  const [debouncedPackageOverride, setDebouncedPackageOverride] =
    useState(packageOverride)
  const [debouncedSessionOverrides, setDebouncedSessionOverrides] =
    useState(sessionOverrides)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedPackageOverride(packageOverride)
      setDebouncedSessionOverrides(sessionOverrides)
    }, 600)
    return () => clearTimeout(timeout)
  }, [packageOverride, sessionOverrides])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "suggestedPricing",
      socialId,
      targetPlayers,
      debouncedPackageOverride,
      debouncedSessionOverrides,
    ],
    queryFn: () =>
      calculateSuggestedPricingAction(socialId, {
        targetPlayers,
        suggestedPackagePrice: Number(debouncedPackageOverride) || 0,
        sessionOverrides: Object.entries(debouncedSessionOverrides).map(
          ([sessionId, suggestedPrice]) => ({
            sessionId,
            suggestedPrice,
          })
        ),
      }),
    enabled: open && !!socialId,
  })

  const currentPackagePrice =
    Number(packageOverride) || data?.summary.suggestedPackagePrice || 0

  const totalSessionPrices = (data?.sessions || []).reduce((sum, s) => {
    const overrideVal = sessionOverrides[s.id]
    const effectiveFee =
      typeof overrideVal === "number" && !isNaN(overrideVal)
        ? overrideVal
        : s.sessionFee > 0
          ? s.sessionFee
          : s.suggestedPrice

    return sum + effectiveFee
  }, 0)

  const effectivePackageRevenue =
    currentPackagePrice > 0
      ? currentPackagePrice * targetPlayers
      : data?.summary.simulatedPackageRevenue || 0

  const effectiveSessionsRevenue =
    totalSessionPrices > 0
      ? totalSessionPrices * targetPlayers
      : data?.summary.simulatedSessionsRevenue || 0

  const effectivePackageProfit =
    currentPackagePrice > 0
      ? effectivePackageRevenue - (data?.summary.totalExpense || 0)
      : data?.summary.simulatedPackageProfit || 0

  const effectiveSessionsProfit =
    totalSessionPrices > 0
      ? effectiveSessionsRevenue - (data?.summary.totalExpense || 0)
      : data?.summary.simulatedSessionsProfit || 0

  const packageExceedsTotalError =
    totalSessionPrices > 0 && currentPackagePrice > totalSessionPrices

  const { mutate: applyPrice, isPending: isApplying } = useMutation({
    mutationFn: () => {
      if (packageExceedsTotalError) {
        throw new Error(
          t("form.validationPackageFeeExceedsTotal") ||
            `Phí trọn gói (${new Intl.NumberFormat("vi-VN").format(currentPackagePrice)}đ) không thể lớn hơn tổng giá các phiên chơi (${new Intl.NumberFormat("vi-VN").format(totalSessionPrices)}đ).`
        )
      }

      return applyPriceAction(socialId, {
        packageFee: currentPackagePrice,
        sessionFees:
          data?.sessions.map((s) => {
            const overrideVal = sessionOverrides[s.id]
            const finalFee =
              typeof overrideVal === "number" && !isNaN(overrideVal)
                ? overrideVal
                : s.sessionFee > 0
                  ? s.sessionFee
                  : s.suggestedPrice

            return {
              sessionId: s.id,
              sessionFee: finalFee,
            }
          }) || [],
      })
    },
    onSuccess: () => {
      toast.success(t("expenses.pricing.appliedSuccessfully"))
      queryClient.invalidateQueries({ queryKey: ["financeSummary", socialId] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || t("expenses.pricing.applyFailed"))
    },
  })

  const handleSessionOverrideChange = (sessionId: string, value: string) => {
    setSessionOverrides((prev) => {
      const next = { ...prev }
      if (!value || isNaN(Number(value))) {
        delete next[sessionId]
      } else {
        next[sessionId] = Number(value)
      }
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="size-5" />
            {t("expenses.pricing.title")}
          </DialogTitle>
          <DialogDescription>
            {t("expenses.pricing.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 px-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="targetPlayers">
              {t("expenses.pricing.expectedPlayers")}
            </Label>
            <Input
              id="targetPlayers"
              type="number"
              value={targetPlayers}
              onChange={(e) => setTargetPlayers(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {isLoading && !data ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : data ? (
            <div className="min-h-[420px] space-y-6">
              <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-5 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("expenses.pricing.bookingCost")}
                  </p>
                  <p className="font-semibold">
                    {formatCurrencyVnd(data.summary.totalBookingCost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("expenses.pricing.manualExpenses")}
                  </p>
                  <p className="font-semibold">
                    {formatCurrencyVnd(data.summary.totalManualExpenses)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("expenses.pricing.totalCost")}
                  </p>
                  <p className="font-semibold">
                    {formatCurrencyVnd(data.summary.totalExpense)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("expenses.pricing.breakEvenPackage")}
                  </p>
                  <p className="font-semibold">
                    {formatCurrencyVnd(data.summary.packageBreakEven)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("expenses.pricing.suggestedPrices")}
                  </p>
                  <p className="font-semibold">
                    {formatCurrencyVnd(totalSessionPrices)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("expenses.pricing.estProfitPackage")}
                  </p>
                  <p
                    className={`font-semibold ${effectivePackageProfit < 0 ? "text-destructive" : "text-emerald-600"}`}
                  >
                    {formatCurrencyVnd(effectivePackageProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("expenses.pricing.simulatedSessionsRevenue")}
                  </p>
                  <p className="font-semibold">
                    {formatCurrencyVnd(effectiveSessionsRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("expenses.pricing.estProfitSessions")}
                  </p>
                  <p
                    className={`font-semibold ${effectiveSessionsProfit < 0 ? "text-destructive" : "text-emerald-600"}`}
                  >
                    {formatCurrencyVnd(effectiveSessionsProfit)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center justify-between">
                  <span>{t("expenses.pricing.fullPackagePrice")}</span>
                  {isFetching && <Loader2 className="size-3 animate-spin" />}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder={new Intl.NumberFormat("vi-VN").format(
                      data.summary.suggestedPackagePrice
                    )}
                    value={
                      packageOverride
                        ? new Intl.NumberFormat("vi-VN").format(
                            Number(packageOverride)
                          )
                        : ""
                    }
                    onChange={(e) => {
                      const numericVal = e.target.value.replace(/\D/g, "")
                      setPackageOverride(numericVal ? Number(numericVal) : "")
                    }}
                    className={
                      packageExceedsTotalError
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                  <div className="text-sm text-muted-foreground">
                    {t("expenses.pricing.currency")}
                  </div>
                </div>
                {packageExceedsTotalError ? (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    {t("form.validationPackageFeeExceedsTotal") ||
                      `Phí trọn gói (${new Intl.NumberFormat("vi-VN").format(currentPackagePrice)}đ) không được vượt quá tổng giá các phiên chơi (${new Intl.NumberFormat("vi-VN").format(totalSessionPrices)}đ).`}
                  </p>
                ) : data.summary.warningPackageBelowBreakEven ? (
                  <p className="text-xs text-destructive">
                    {t("expenses.pricing.warningBelowBreakEven")}
                  </p>
                ) : null}
              </div>

              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("expenses.pricing.headers.session")}
                      </TableHead>
                      <TableHead>
                        {t("expenses.pricing.headers.bookingCost")}
                      </TableHead>
                      <TableHead>
                        {t("expenses.pricing.headers.currentFee")}
                      </TableHead>
                      <TableHead>
                        {t("expenses.pricing.headers.priceOverride")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {session.title ||
                            t("expenses.pricing.sessionFallback")}
                        </TableCell>
                        <TableCell>
                          {formatCurrencyVnd(session.bookingCost)}
                        </TableCell>
                        <TableCell>
                          {formatCurrencyVnd(session.sessionFee)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              className="h-8 w-28"
                              placeholder={new Intl.NumberFormat(
                                "vi-VN"
                              ).format(
                                session.sessionFee > 0
                                  ? session.sessionFee
                                  : session.suggestedPrice
                              )}
                              value={
                                sessionOverrides[session.id] !== undefined
                                  ? new Intl.NumberFormat("vi-VN").format(
                                      sessionOverrides[session.id]
                                    )
                                  : ""
                              }
                              onChange={(e) => {
                                const numericVal = e.target.value.replace(
                                  /\D/g,
                                  ""
                                )
                                handleSessionOverrideChange(
                                  session.id,
                                  numericVal
                                )
                              }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {t("expenses.pricing.currency")}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("expenses.pricing.cancel")}
          </Button>
          <Button
            onClick={() => applyPrice()}
            disabled={isApplying || !data || packageExceedsTotalError}
          >
            {isApplying && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("expenses.pricing.applyPricing")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
