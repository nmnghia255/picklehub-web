"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useSportCenterAi } from "@/features/ai/hooks/use-ai-queries"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { sportCenterWizardClient } from "../api/sport-center-wizard-client"
import type { CancellationPolicy } from "../types/cancellation-policy"
import type { PriceSlot } from "../types/price-slot"

type Section = "price-slots" | "policy"

interface Props {
  centerId: string
  section: Section
  initialPriceSlots: PriceSlot[]
  initialPolicy: CancellationPolicy
}

interface NewSlot {
  startTime: string
  endTime: string
  pricePerHour: string
}

interface PolicyTierDraft {
  id: string
  minDaysBeforeStart: string
  refundPercent: string
}

const emptySlot: NewSlot = { startTime: "", endTime: "", pricePerHour: "" }

export function CenterPricingPolicyPanel({
  centerId,
  section,
  initialPriceSlots,
  initialPolicy,
}: Props) {
  const { t, i18n } = useSportCenterManagementTranslation()
  const isVi = i18n.language === "vi"
  const queryClient = useQueryClient()
  const [newSlot, setNewSlot] = useState<NewSlot>(emptySlot)
  const [slotDialogOpen, setSlotDialogOpen] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [slotDrafts, setSlotDrafts] = useState<PriceSlot[]>(initialPriceSlots)
  const [deleteTarget, setDeleteTarget] = useState<PriceSlot | null>(null)
  const [tierDeleteTarget, setTierDeleteTarget] =
    useState<PolicyTierDraft | null>(null)
  const [tierDialogOpen, setTierDialogOpen] = useState(false)
  const [newTier, setNewTier] = useState({
    minDaysBeforeStart: "",
    refundPercent: "",
  })
  const [allowCancellation, setAllowCancellation] = useState(
    initialPolicy.allowCancellation
  )
  const [tierDrafts, setTierDrafts] = useState<PolicyTierDraft[]>(
    initialPolicy.tiers.map((tier) => ({
      id: tier.id,
      minDaysBeforeStart: String(tier.minDaysBeforeStart),
      refundPercent: String(tier.refundPercent),
    }))
  )

  const priceSlotsQuery = useQuery({
    queryKey: ["sport-center-management", "price-slots", centerId],
    queryFn: () => sportCenterWizardClient.listPriceSlots(centerId),
    enabled: section === "price-slots" && Boolean(centerId),
    initialData: initialPriceSlots,
  })
  const policyQuery = useQuery({
    queryKey: ["sport-center-management", "policy", centerId],
    queryFn: () => sportCenterWizardClient.getCancellationPolicy(centerId),
    enabled: section === "policy" && Boolean(centerId),
    initialData: initialPolicy,
  })

  const aiQuery = useSportCenterAi(centerId, isVi ? "vi" : "en", {
    enabled: aiDialogOpen && Boolean(centerId),
  })

  const invalidateDetail = async (queryKey: string) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["sport-center-management", queryKey, centerId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["sport-center-management", "detail", centerId],
      }),
    ])
  }

  const createSlotMutation = useMutation({
    mutationFn: () => {
      const pricePerHour = Number(newSlot.pricePerHour)
      if (
        !newSlot.startTime ||
        !newSlot.endTime ||
        !Number.isFinite(pricePerHour) ||
        pricePerHour < 0
      ) {
        throw new Error(t("managementDetail.priceSlots.invalid"))
      }
      return sportCenterWizardClient.createPriceSlot(centerId, {
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        pricePerHour,
      })
    },
    onSuccess: async () => {
      setNewSlot(emptySlot)
      setSlotDialogOpen(false)
      await invalidateDetail("price-slots")
      toast.success(t("managementDetail.priceSlots.saveSuccess"))
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : t("managementDetail.priceSlots.saveError")
      ),
  })

  const saveSlotsMutation = useMutation({
    mutationFn: () =>
      sportCenterWizardClient.updatePriceSlots(centerId, {
        priceSlots: slotDrafts.map(({ startTime, endTime, pricePerHour }) => ({
          startTime,
          endTime,
          pricePerHour,
        })),
      }),
    onSuccess: async () => {
      await invalidateDetail("price-slots")
      toast.success(t("managementDetail.priceSlots.saveSuccess"))
    },
    onError: () => toast.error(t("managementDetail.priceSlots.saveError")),
  })

  const deleteSlotMutation = useMutation({
    mutationFn: (slotId: string) =>
      sportCenterWizardClient.deletePriceSlot(centerId, slotId),
    onSuccess: async () => {
      if (deleteTarget) {
        setSlotDrafts((current) =>
          current.filter((slot) => slot.id !== deleteTarget.id)
        )
      }
      setDeleteTarget(null)
      await invalidateDetail("price-slots")
      toast.success(t("managementDetail.priceSlots.deleteSuccess"))
    },
    onError: () => toast.error(t("managementDetail.priceSlots.deleteError")),
  })

  const savePolicyMutation = useMutation({
    mutationFn: () => {
      const tiers = tierDrafts.map(({ minDaysBeforeStart, refundPercent }) => ({
        minDaysBeforeStart: Number(minDaysBeforeStart),
        refundPercent: Number(refundPercent),
      }))
      if (
        tiers.some(
          (tier) =>
            !Number.isInteger(tier.minDaysBeforeStart) ||
            tier.minDaysBeforeStart < 0 ||
            !Number.isFinite(tier.refundPercent) ||
            tier.refundPercent < 0 ||
            tier.refundPercent > 100
        )
      ) {
        throw new Error(t("managementDetail.policy.invalid"))
      }
      return sportCenterWizardClient.updateCancellationPolicy(centerId, {
        allowCancellation,
        tiers,
      })
    },
    onSuccess: async () => {
      await invalidateDetail("policy")
      toast.success(t("managementDetail.policy.saveSuccess"))
    },
    onError: () => toast.error(t("managementDetail.policy.saveError")),
  })

  const addTier = () => {
    const minDaysBeforeStart = Number(newTier.minDaysBeforeStart)
    const refundPercent = Number(newTier.refundPercent)
    if (
      !Number.isInteger(minDaysBeforeStart) ||
      minDaysBeforeStart < 0 ||
      !Number.isFinite(refundPercent) ||
      refundPercent < 0 ||
      refundPercent > 100
    ) {
      toast.error(t("managementDetail.policy.invalid"))
      return
    }

    setTierDrafts((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        minDaysBeforeStart: String(minDaysBeforeStart),
        refundPercent: String(refundPercent),
      },
    ])
    setNewTier({ minDaysBeforeStart: "", refundPercent: "" })
    setTierDialogOpen(false)
  }

  const priceSlotsValid = slotDrafts.every(
    (slot) =>
      slot.startTime < slot.endTime &&
      Number.isFinite(slot.pricePerHour) &&
      slot.pricePerHour >= 0
  )
  const policyTiersValid = tierDrafts.every((tier) => {
    const minDays = Number(tier.minDaysBeforeStart)
    const refund = Number(tier.refundPercent)
    return (
      Number.isInteger(minDays) &&
      minDays >= 0 &&
      Number.isFinite(refund) &&
      refund >= 0 &&
      refund <= 100
    )
  })

  if (section === "price-slots") {
    return (
      <>
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("managementDetail.priceSlots.title")}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-indigo-200 bg-indigo-50/5 text-indigo-600 hover:bg-indigo-50/10 dark:border-indigo-900 dark:text-indigo-400"
                onClick={() => setAiDialogOpen(true)}
              >
                <Sparkles className="mr-2 size-4 animate-pulse fill-indigo-500 text-indigo-500" />
                {isVi ? "Gợi ý giá từ AI" : "AI Suggestions"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSlotDialogOpen(true)}
                disabled={createSlotMutation.isPending}
              >
                <Plus className="mr-2 size-4" />
                {t("managementDetail.priceSlots.add")}
              </Button>
              <Button
                type="button"
                onClick={() => saveSlotsMutation.mutate()}
                disabled={
                  saveSlotsMutation.isPending ||
                  slotDrafts.length === 0 ||
                  !priceSlotsValid
                }
              >
                <Save className="mr-2 size-4" />
                {t("managementDetail.priceSlots.save")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {priceSlotsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">
                {t("common.loading")}
              </p>
            ) : slotDrafts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("managementDetail.priceSlots.empty")}
              </p>
            ) : (
              slotDrafts.map((slot, index) => (
                <div
                  key={slot.id}
                  className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <div className="space-y-2">
                    <Label htmlFor={`slot-start-${slot.id}`}>
                      {t("managementDetail.priceSlots.startTime")}
                    </Label>
                    <Input
                      id={`slot-start-${slot.id}`}
                      type="time"
                      value={slot.startTime}
                      onChange={(event) =>
                        setSlotDrafts((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, startTime: event.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`slot-end-${slot.id}`}>
                      {t("managementDetail.priceSlots.endTime")}
                    </Label>
                    <Input
                      id={`slot-end-${slot.id}`}
                      type="time"
                      value={slot.endTime}
                      onChange={(event) =>
                        setSlotDrafts((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, endTime: event.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`slot-price-${slot.id}`}>
                      {t("managementDetail.priceSlots.pricePerHour")}
                    </Label>
                    <Input
                      id={`slot-price-${slot.id}`}
                      type="number"
                      min="0"
                      value={slot.pricePerHour}
                      onChange={(event) =>
                        setSlotDrafts((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  pricePerHour: Number(event.target.value),
                                }
                              : item
                          )
                        )
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("managementDetail.priceSlots.delete")}
                    onClick={() => setDeleteTarget(slot)}
                    disabled={deleteSlotMutation.isPending}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Dialog
          open={slotDialogOpen}
          onOpenChange={(open) => {
            if (!createSlotMutation.isPending) setSlotDialogOpen(open)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("managementDetail.priceSlots.createTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("managementDetail.priceSlots.createDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>{t("managementDetail.priceSlots.startTime")}</Label>
                <Input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(event) =>
                    setNewSlot((current) => ({
                      ...current,
                      startTime: event.target.value,
                    }))
                  }
                  disabled={createSlotMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("managementDetail.priceSlots.endTime")}</Label>
                <Input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(event) =>
                    setNewSlot((current) => ({
                      ...current,
                      endTime: event.target.value,
                    }))
                  }
                  disabled={createSlotMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("managementDetail.priceSlots.pricePerHour")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={newSlot.pricePerHour}
                  onChange={(event) =>
                    setNewSlot((current) => ({
                      ...current,
                      pricePerHour: event.target.value,
                    }))
                  }
                  disabled={createSlotMutation.isPending}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSlotDialogOpen(false)}
                disabled={createSlotMutation.isPending}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={() => createSlotMutation.mutate()}
                disabled={createSlotMutation.isPending}
              >
                {createSlotMutation.isPending
                  ? t("common.saving")
                  : t("managementDetail.priceSlots.confirmAdd")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("managementDetail.priceSlots.deleteTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("managementDetail.priceSlots.deleteDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteSlotMutation.isPending}>
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                disabled={deleteSlotMutation.isPending}
                onClick={(event) => {
                  event.preventDefault()
                  if (deleteTarget) deleteSlotMutation.mutate(deleteTarget.id)
                }}
              >
                {t("managementDetail.priceSlots.confirmDelete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog
          open={aiDialogOpen}
          onOpenChange={(open) => {
            if (!aiQuery.isFetching) setAiDialogOpen(open)
          }}
        >
          <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Sparkles className="size-5 animate-pulse fill-indigo-500 text-indigo-500" />
                {isVi ? "Gợi ý định giá từ AI" : "AI Pricing Suggestions"}
              </DialogTitle>
              <DialogDescription>
                {isVi
                  ? "Phân tích xu hướng đặt sân trong 30 ngày qua và đề xuất tối ưu hóa giá."
                  : "Analyzes 30-day historical booking data for this sport center to suggest optimized pricing slots."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6">
              {aiQuery.isLoading ? (
                <div className="space-y-4 py-8">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="size-5 animate-spin text-indigo-500" />
                    <span>
                      {isVi
                        ? "Đang thu thập và phân tích dữ liệu đặt sân..."
                        : "Aggregating and analyzing booking data..."}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </div>
              ) : aiQuery.error ? (
                <div className="flex flex-col items-center justify-center space-y-3 py-8 text-center">
                  <AlertCircle className="size-10 animate-bounce text-destructive" />
                  <p className="text-sm font-medium text-destructive">
                    {isVi
                      ? "Không thể lấy gợi ý từ AI."
                      : "Failed to load AI suggestions."}
                  </p>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    {aiQuery.error instanceof Error
                      ? aiQuery.error.message
                      : ""}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => aiQuery.refetch()}
                  >
                    {isVi ? "Thử lại" : "Try Again"}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Trend Analysis */}
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-1.5 text-sm font-bold text-indigo-900 dark:text-indigo-200">
                      <TrendingUp className="size-4 text-indigo-500" />
                      {isVi
                        ? "Phân tích xu hướng đặt sân"
                        : "Booking Trend Analysis"}
                    </h4>
                    <div className="rounded-lg border border-indigo-100/50 bg-indigo-50/20 p-4 text-sm leading-relaxed text-foreground/90 dark:border-indigo-900/50 dark:bg-indigo-950/20 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-bold [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4">
                      <ReactMarkdown>
                        {aiQuery.data?.data?.trendAnalysis}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {aiQuery.data?.data?.recommendations &&
                    aiQuery.data?.data?.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-foreground">
                          {isVi
                            ? "Khuyến nghị tối ưu doanh thu"
                            : "Revenue Optimization Recommendations"}
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {aiQuery.data?.data?.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                                {i + 1}
                              </span>
                              <span className="leading-snug">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Suggested Pricing Slots */}
                  {aiQuery.data?.data?.suggestedPriceSlots &&
                    aiQuery.data?.data?.suggestedPriceSlots.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-foreground">
                          {isVi
                            ? "Các khung giờ đề xuất"
                            : "Suggested Dynamic Price Slots"}
                        </h4>
                        <div className="overflow-hidden rounded-lg border">
                          <table className="w-full border-collapse text-left text-sm">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="p-3 font-semibold">
                                  {isVi ? "Giờ bắt đầu" : "Start Time"}
                                </th>
                                <th className="p-3 font-semibold">
                                  {isVi ? "Giờ kết thúc" : "End Time"}
                                </th>
                                <th className="p-3 text-right font-semibold">
                                  {isVi
                                    ? "Giá gợi ý (VND/giờ)"
                                    : "Suggested Price/Hr"}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {aiQuery.data?.data?.suggestedPriceSlots.map(
                                (slot, index) => (
                                  <tr
                                    key={index}
                                    className="border-b last:border-0 hover:bg-muted/20"
                                  >
                                    <td className="p-3">{slot.startTime}</td>
                                    <td className="p-3">{slot.endTime}</td>
                                    <td className="p-3 text-right font-semibold text-indigo-600 dark:text-indigo-400">
                                      {isVi
                                        ? new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                          }).format(slot.pricePerHour)
                                        : new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                          }).format(slot.pricePerHour)}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>

            <DialogFooter className="gap-2 border-t bg-muted/20 p-6 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAiDialogOpen(false)}
              >
                {isVi ? "Đóng" : "Close"}
              </Button>
              {aiQuery.data?.success &&
                aiQuery.data?.data?.suggestedPriceSlots && (
                  <Button
                    type="button"
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => {
                      const suggested =
                        aiQuery.data?.data?.suggestedPriceSlots || []
                      const mapped = suggested.map((slot, idx) => ({
                        id: `ai-suggested-${idx}-${Date.now()}`,
                        centerId,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        pricePerHour: slot.pricePerHour,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      }))
                      setSlotDrafts(mapped)
                      setAiDialogOpen(false)
                      toast.success(
                        isVi
                          ? "Đã áp dụng các khung giá gợi ý từ AI làm bản thảo. Hãy bấm Lưu để lưu lại."
                          : "AI suggested slots applied to drafts. Please click Save to persist."
                      )
                    }}
                  >
                    <Sparkles className="mr-2 size-4 fill-yellow-300 text-yellow-300" />
                    {isVi ? "Áp dụng giá gợi ý từ AI" : "Apply AI Suggestions"}
                  </Button>
                )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{t("managementDetail.policy.title")}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setTierDialogOpen(true)}
          >
            <Plus className="mr-2 size-4" />
            {t("managementDetail.policy.addTier")}
          </Button>
          <Button
            type="button"
            onClick={() => savePolicyMutation.mutate()}
            disabled={savePolicyMutation.isPending || !policyTiersValid}
          >
            <Save className="mr-2 size-4" />
            {savePolicyMutation.isPending
              ? t("common.saving")
              : t("managementDetail.policy.save")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {policyQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : null}
        <div className="flex items-center justify-between rounded-2xl border p-4">
          <div>
            <Label>{t("managementDetail.policy.allowCancellation")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("managementDetail.policy.description")}
            </p>
          </div>
          <Switch
            checked={allowCancellation}
            onCheckedChange={setAllowCancellation}
          />
        </div>
        <div className="space-y-3">
          {tierDrafts.map((tier, index) => (
            <div
              key={tier.id}
              className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <div className="space-y-2">
                <Label>{t("managementDetail.policy.minDays")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={tier.minDaysBeforeStart}
                  onChange={(event) =>
                    setTierDrafts((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, minDaysBeforeStart: event.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("managementDetail.policy.refundPercent")}</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={tier.refundPercent}
                  onChange={(event) =>
                    setTierDrafts((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, refundPercent: event.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("managementDetail.policy.removeTier")}
                onClick={() => setTierDeleteTarget(tier)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <Dialog
        open={tierDialogOpen}
        onOpenChange={(open) => {
          if (!savePolicyMutation.isPending) setTierDialogOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("managementDetail.policy.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("managementDetail.policy.createDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("managementDetail.policy.minDays")}</Label>
              <Input
                type="number"
                min="0"
                value={newTier.minDaysBeforeStart}
                onChange={(event) =>
                  setNewTier((current) => ({
                    ...current,
                    minDaysBeforeStart: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("managementDetail.policy.refundPercent")}</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newTier.refundPercent}
                onChange={(event) =>
                  setNewTier((current) => ({
                    ...current,
                    refundPercent: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTierDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="button" onClick={addTier}>
              {t("managementDetail.policy.confirmAdd")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={Boolean(tierDeleteTarget)}
        onOpenChange={(open) => !open && setTierDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("managementDetail.policy.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("managementDetail.policy.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault()
                if (tierDeleteTarget) {
                  setTierDrafts((current) =>
                    current.filter((tier) => tier.id !== tierDeleteTarget.id)
                  )
                  setTierDeleteTarget(null)
                }
              }}
            >
              {t("managementDetail.policy.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
