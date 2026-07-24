import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, RefreshCw, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { sportCenterWizardClient } from "../../api/sport-center-wizard-client"
import { sportCenterOwnerListQueryKey } from "../../queries"
import type {
  SportCenter,
  UpdateSportCenterRequest,
} from "../../types/sport-center"
import { ImageUploadControl } from "../image-upload-control"
import {
  editDetailQueryKey,
  type EditFormState,
  getEditForm,
  isValidHttpUrl,
  managementDetailQueryKey,
  type PendingEditRemoval,
} from "./types"

export function SportCenterEditDialog({
  center,
  open,
  onClose,
}: {
  center: SportCenter | null
  open: boolean
  onClose: () => void
}) {
  const { t } = useSportCenterManagementTranslation()
  const queryClient = useQueryClient()

  const [editForm, setEditForm] = useState<EditFormState | null>(null)
  const [editImagesUploading, setEditImagesUploading] = useState(false)
  const [editQrUploading, setEditQrUploading] = useState(false)
  const [pendingEditRemoval, setPendingEditRemoval] =
    useState<PendingEditRemoval | null>(null)
  const hydratedEditId = useRef<string | null>(null)

  const centerId = center?.id ?? ""

  const editDetailQuery = useQuery({
    queryKey: editDetailQueryKey(centerId),
    queryFn: () => sportCenterWizardClient.getSportCenter(centerId),
    enabled: Boolean(centerId) && open,
  })

  const handleClose = () => {
    setEditForm(null)
    hydratedEditId.current = null
    setEditImagesUploading(false)
    setEditQrUploading(false)
    setPendingEditRemoval(null)
    onClose()
  }

  useEffect(() => {
    if (
      open &&
      center &&
      editDetailQuery.data &&
      hydratedEditId.current !== center.id
    ) {
      setEditForm(getEditForm(editDetailQuery.data))
      hydratedEditId.current = center.id
    }
  }, [editDetailQuery.data, center, open])

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string
      request: UpdateSportCenterRequest
    }) => sportCenterWizardClient.updateSportCenter(id, request),
    onSuccess: async (updatedCenter) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: sportCenterOwnerListQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: managementDetailQueryKey(updatedCenter.id),
        }),
        queryClient.invalidateQueries({
          queryKey: editDetailQueryKey(updatedCenter.id),
        }),
      ])
      handleClose()
      toast.success(t("centerList.toast.updated"))
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("centerList.toast.updateFailed")
      )
    },
  })

  const submitEdit = () => {
    if (!center || !editForm) return

    const name = editForm.name.trim()
    const address = editForm.address.trim()
    const phone = editForm.phone.trim()
    const email = editForm.email.trim()
    const openTime = editForm.openTime
    const closeTime = editForm.closeTime
    const basePrice = Number(editForm.basePrice)
    const rules = editForm.rules.map((item) => item.trim()).filter(Boolean)
    const amenities = editForm.amenities
      .map((item) => item.trim())
      .filter(Boolean)
    const images = editForm.images.filter(
      (url) => isValidHttpUrl(url) && !url.startsWith("blob:")
    )
    const paymentQrUrl = editForm.paymentQrUrl.trim()

    if (!name || !address || !phone) {
      toast.error(t("centerList.validation.required"))
      return
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error(t("centerList.validation.email"))
      return
    }
    if (!openTime || !closeTime || openTime >= closeTime) {
      toast.error(t("centerList.validation.time"))
      return
    }
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      toast.error(t("centerList.validation.basePrice"))
      return
    }
    if (images.length !== editForm.images.length) {
      toast.error(t("centerList.validation.imageUrl"))
      return
    }
    if (paymentQrUrl && !isValidHttpUrl(paymentQrUrl)) {
      toast.error(t("centerList.validation.imageUrl"))
      return
    }

    updateMutation.mutate({
      id: center.id,
      request: {
        name,
        address,
        phone,
        email: email || undefined,
        description: editForm.description.trim() || undefined,
        images,
        rules,
        openTime,
        closeTime,
        basePrice,
        amenities,
        paymentAccountName: editForm.paymentAccountName.trim(),
        paymentAccountNumber: editForm.paymentAccountNumber.trim(),
        paymentBankName: editForm.paymentBankName.trim(),
        paymentQrUrl: paymentQrUrl || center.paymentQrUrl || undefined,
      },
    })
  }

  const confirmEditRemoval = () => {
    if (!pendingEditRemoval || !editForm) return

    if (pendingEditRemoval.kind === "rule") {
      setEditForm({
        ...editForm,
        rules: editForm.rules.filter(
          (_, index) => index !== pendingEditRemoval.index
        ),
      })
    } else {
      setEditForm({
        ...editForm,
        amenities: editForm.amenities.filter(
          (_, index) => index !== pendingEditRemoval.index
        ),
      })
    }
    setPendingEditRemoval(null)
  }

  const isBusy =
    updateMutation.isPending || editImagesUploading || editQrUploading

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen && !updateMutation.isPending) {
            handleClose()
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("centerList.edit.title")}</DialogTitle>
            <DialogDescription>
              {t("centerList.edit.description")}
            </DialogDescription>
          </DialogHeader>
          {editDetailQuery.isLoading && !editForm ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("centerList.edit.loading")}
            </p>
          ) : editDetailQuery.isError ? (
            <div className="space-y-3 py-6 text-center">
              <p className="text-sm text-destructive">
                {t("centerList.edit.loadError")}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => editDetailQuery.refetch()}
              >
                <RefreshCw />
                {t("centerList.actions.retry")}
              </Button>
            </div>
          ) : editForm ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="center-edit-name">
                  {t("centerList.fields.name")}
                </Label>
                <Input
                  id="center-edit-name"
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm({ ...editForm, name: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="center-edit-address">
                  {t("centerList.fields.address")}
                </Label>
                <Input
                  id="center-edit-address"
                  value={editForm.address}
                  onChange={(event) =>
                    setEditForm({ ...editForm, address: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="center-edit-phone">
                  {t("centerList.fields.phone")}
                </Label>
                <Input
                  id="center-edit-phone"
                  value={editForm.phone}
                  onChange={(event) =>
                    setEditForm({ ...editForm, phone: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="center-edit-email">
                  {t("centerList.fields.email")}
                </Label>
                <Input
                  id="center-edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(event) =>
                    setEditForm({ ...editForm, email: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="center-edit-open">
                  {t("centerList.fields.openTime")}
                </Label>
                <Input
                  id="center-edit-open"
                  type="time"
                  value={editForm.openTime}
                  onChange={(event) =>
                    setEditForm({ ...editForm, openTime: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="center-edit-close">
                  {t("centerList.fields.closeTime")}
                </Label>
                <Input
                  id="center-edit-close"
                  type="time"
                  value={editForm.closeTime}
                  onChange={(event) =>
                    setEditForm({ ...editForm, closeTime: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="center-edit-price">
                  {t("centerList.fields.basePrice")}
                </Label>
                <Input
                  id="center-edit-price"
                  type="number"
                  min="0"
                  value={editForm.basePrice}
                  onChange={(event) =>
                    setEditForm({ ...editForm, basePrice: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="center-edit-description">
                  {t("centerList.fields.description")}
                </Label>
                <Textarea
                  id="center-edit-description"
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      description: event.target.value,
                    })
                  }
                  className="min-h-24"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("centerList.fields.images")}</Label>
                <ImageUploadControl
                  value={editForm.images}
                  multiple
                  label={t("centerList.fields.chooseImages")}
                  onChange={(value) =>
                    setEditForm({
                      ...editForm,
                      images: Array.isArray(value)
                        ? value
                        : value
                          ? [value]
                          : [],
                    })
                  }
                  onUploadingChange={setEditImagesUploading}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("centerList.fields.rules")}</Label>
                <div className="space-y-2">
                  {editForm.rules.map((rule, index) => (
                    <div key={`rule-${index}`} className="flex gap-2">
                      <Input
                        value={rule}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            rules: editForm.rules.map((item, itemIndex) =>
                              itemIndex === index ? event.target.value : item
                            ),
                          })
                        }
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          setPendingEditRemoval({
                            kind: "rule",
                            index,
                            label: rule.trim() || t("centerList.fields.rules"),
                          })
                        }
                        aria-label={t("centerList.fields.removeRule")}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setEditForm({
                        ...editForm,
                        rules: [...editForm.rules, ""],
                      })
                    }
                  >
                    <Plus />
                    {t("centerList.fields.addRule")}
                  </Button>
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("centerList.fields.amenities")}</Label>
                <div className="space-y-2">
                  {editForm.amenities.map((amenity, index) => (
                    <div key={`amenity-${index}`} className="flex gap-2">
                      <Input
                        value={amenity}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            amenities: editForm.amenities.map(
                              (item, itemIndex) =>
                                itemIndex === index ? event.target.value : item
                            ),
                          })
                        }
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          setPendingEditRemoval({
                            kind: "amenity",
                            index,
                            label:
                              amenity.trim() ||
                              t("centerList.fields.amenities"),
                          })
                        }
                        aria-label={t("centerList.fields.removeAmenity")}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setEditForm({
                        ...editForm,
                        amenities: [...editForm.amenities, ""],
                      })
                    }
                  >
                    <Plus />
                    {t("centerList.fields.addAmenity")}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="center-edit-account-name">
                  {t("centerList.fields.paymentAccountName")}
                </Label>
                <Input
                  id="center-edit-account-name"
                  value={editForm.paymentAccountName}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      paymentAccountName: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="center-edit-account-number">
                  {t("centerList.fields.paymentAccountNumber")}
                </Label>
                <Input
                  id="center-edit-account-number"
                  value={editForm.paymentAccountNumber}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      paymentAccountNumber: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="center-edit-bank-name">
                  {t("centerList.fields.paymentBankName")}
                </Label>
                <Input
                  id="center-edit-bank-name"
                  value={editForm.paymentBankName}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      paymentBankName: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("centerList.fields.paymentQrUrl")}</Label>
                <ImageUploadControl
                  value={editForm.paymentQrUrl}
                  label={t("centerList.fields.chooseQr")}
                  onChange={(value) =>
                    setEditForm({
                      ...editForm,
                      paymentQrUrl: Array.isArray(value)
                        ? (value[0] ?? "")
                        : value,
                    })
                  }
                  onUploadingChange={setEditQrUploading}
                />
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("centerList.edit.loading")}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isBusy}
            >
              {t("centerList.actions.cancel")}
            </Button>
            <Button type="button" onClick={submitEdit} disabled={isBusy}>
              {updateMutation.isPending
                ? t("centerList.actions.saving")
                : t("centerList.actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingEditRemoval)}
        onOpenChange={(isOpen) => !isOpen && setPendingEditRemoval(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("centerList.edit.removeTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("centerList.edit.removeDescription", {
                name: pendingEditRemoval?.label ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("centerList.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmEditRemoval}
            >
              {t("centerList.edit.confirmRemove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
