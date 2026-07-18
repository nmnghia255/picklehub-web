"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Save, Trash2 } from "lucide-react"
import { useState } from "react"
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
import { Switch } from "@/components/ui/switch"
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
  const { t } = useSportCenterManagementTranslation()
  const queryClient = useQueryClient()
  const [newSlot, setNewSlot] = useState<NewSlot>(emptySlot)
  const [slotDialogOpen, setSlotDialogOpen] = useState(false)
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
