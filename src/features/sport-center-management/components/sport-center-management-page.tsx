"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Building2,
  CalendarDays,
  Clock3,
  Edit3,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { FallbackImage } from "@/components/fallback-image"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

import { sportCenterWizardClient } from "../api/sport-center-wizard-client"
import { sportCenterOwnerListQueryKey } from "../queries"
import type {
  SportCenter,
  UpdateSportCenterRequest,
} from "../types/sport-center"
import { ImageUploadControl } from "./image-upload-control"

const managementDetailQueryKey = (centerId: string) => [
  "sport-center-management",
  "detail",
  centerId,
]

const editDetailQueryKey = (centerId: string) => [
  "sport-center-management",
  "edit-detail",
  centerId,
]

type EditFormState = {
  name: string
  address: string
  phone: string
  email: string
  description: string
  openTime: string
  closeTime: string
  basePrice: string
  images: string[]
  rules: string[]
  amenities: string[]
  paymentAccountName: string
  paymentAccountNumber: string
  paymentBankName: string
  paymentQrUrl: string
}

type PendingEditRemoval = {
  kind: "rule" | "amenity"
  index: number
  label: string
}

function getEditForm(center: SportCenter): EditFormState {
  return {
    name: center.name,
    address: center.address,
    phone: center.phone,
    email: center.email ?? "",
    description: center.description ?? "",
    openTime: center.openTime,
    closeTime: center.closeTime,
    basePrice: String(center.basePrice),
    images: [...(center.images ?? [])],
    rules: [...(center.rules ?? [])],
    amenities: [...(center.amenities ?? [])],
    paymentAccountName: center.paymentAccountName ?? "",
    paymentAccountNumber: center.paymentAccountNumber ?? "",
    paymentBankName: center.paymentBankName ?? "",
    paymentQrUrl: center.paymentQrUrl ?? "",
  }
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(value))
}

function CenterListSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="h-44 animate-pulse bg-muted" />
          <CardContent className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-9 w-full animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SportCenterManagementCard({
  center,
  onEdit,
  onDelete,
  deleting,
  locale,
}: {
  center: SportCenter
  onEdit: (center: SportCenter) => void
  onDelete: (center: SportCenter) => void
  deleting: boolean
  locale: string
}) {
  const { t } = useSportCenterManagementTranslation()
  const coverImage = center.images?.[0]
  const statusKey = center.status === "ACTIVE" ? "active" : "inactive"
  const initials = center.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  return (
    <Card className="overflow-hidden py-0">
      <div className="relative h-44 bg-muted">
        {coverImage ? (
          <FallbackImage
            src={coverImage}
            alt={t("centerList.imageAlt", { name: center.name })}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-linear-to-br from-primary/10 via-background to-muted text-muted-foreground">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-background shadow-sm">
              <Building2 className="size-7 text-primary" />
            </div>
            <span className="text-sm">{t("centerList.noImage")}</span>
          </div>
        )}
        <Badge
          className={`absolute top-3 left-3 ${
            center.status === "ACTIVE"
              ? "border-emerald-200 bg-emerald-500 text-white"
              : "bg-background/90 text-foreground"
          }`}
        >
          {t(`centerList.status.${statusKey}`)}
        </Badge>
      </div>

      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted font-semibold text-primary">
            {initials || <Building2 className="size-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold">{center.name}</h2>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span className="line-clamp-2">{center.address}</span>
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="size-4" />
            {center.openTime} - {center.closeTime}
          </span>
          <span className="inline-flex items-center gap-2 truncate">
            <Phone className="size-4 shrink-0" />
            {center.phone}
          </span>
          <span className="inline-flex items-center gap-2">
            <Building2 className="size-4" />
            {t("centerList.courts", {
              count: center._count?.courts ?? 0,
            })}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" />
            {t("centerList.created", {
              date: formatDate(center.createdAt, locale),
            })}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/sport-center-management/${center.id}`}>
              {t("centerList.actions.view")}
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(center)}
            aria-label={t("centerList.actions.edit")}
          >
            <Edit3 />
            <span className="sr-only sm:not-sr-only">
              {t("centerList.actions.edit")}
            </span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onDelete(center)}
            disabled={deleting}
            aria-label={t("centerList.actions.delete")}
          >
            {deleting ? (
              <MoreHorizontal className="animate-pulse" />
            ) : (
              <Trash2 />
            )}
            <span className="sr-only sm:not-sr-only">
              {t("centerList.actions.delete")}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function SportCenterManagementPage() {
  const { t } = useSportCenterManagementTranslation()
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<SportCenter | null>(null)
  const [editTarget, setEditTarget] = useState<SportCenter | null>(null)
  const [editForm, setEditForm] = useState<EditFormState | null>(null)
  const [editImagesUploading, setEditImagesUploading] = useState(false)
  const [editQrUploading, setEditQrUploading] = useState(false)
  const [pendingEditRemoval, setPendingEditRemoval] =
    useState<PendingEditRemoval | null>(null)
  const hydratedEditId = useRef<string | null>(null)

  const centersQuery = useQuery({
    queryKey: sportCenterOwnerListQueryKey,
    queryFn: sportCenterWizardClient.listOwnerSportCenters,
  })

  const editDetailQuery = useQuery({
    queryKey: editDetailQueryKey(editTarget?.id ?? ""),
    queryFn: () => sportCenterWizardClient.getSportCenter(editTarget!.id),
    enabled: Boolean(editTarget?.id),
  })

  useEffect(() => {
    if (
      editTarget &&
      editDetailQuery.data &&
      hydratedEditId.current !== editTarget.id
    ) {
      setEditForm(getEditForm(editDetailQuery.data))
      hydratedEditId.current = editTarget.id
    }
  }, [editDetailQuery.data, editTarget])

  const updateMutation = useMutation({
    mutationFn: async ({
      centerId,
      request,
    }: {
      centerId: string
      request: UpdateSportCenterRequest
    }) => sportCenterWizardClient.updateSportCenter(centerId, request),
    onSuccess: async (center) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: sportCenterOwnerListQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: managementDetailQueryKey(center.id),
        }),
        queryClient.invalidateQueries({
          queryKey: editDetailQueryKey(center.id),
        }),
      ])
      setEditTarget(null)
      setEditForm(null)
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

  const deleteMutation = useMutation({
    mutationFn: (centerId: string) =>
      sportCenterWizardClient.deleteSportCenter(centerId),
    onSuccess: async (_, centerId) => {
      await queryClient.invalidateQueries({
        queryKey: sportCenterOwnerListQueryKey,
      })
      queryClient.removeQueries({
        queryKey: managementDetailQueryKey(centerId),
      })
      queryClient.removeQueries({ queryKey: editDetailQueryKey(centerId) })
      setDeleteTarget(null)
      toast.success(t("centerList.toast.deleted"))
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("centerList.toast.deleteFailed")
      )
    },
  })

  const openEdit = (center: SportCenter) => {
    setEditTarget(center)
    setEditForm(null)
    hydratedEditId.current = null
    setEditImagesUploading(false)
    setEditQrUploading(false)
  }

  const submitEdit = () => {
    if (!editTarget || !editForm) return

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
      centerId: editTarget.id,
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
        paymentQrUrl: paymentQrUrl || editTarget.paymentQrUrl || undefined,
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

  const locale = typeof navigator === "undefined" ? "en-US" : navigator.language
  const centers = centersQuery.data ?? []

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <Badge variant="secondary">{t("centerList.badge")}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("centerList.title")}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            {t("centerList.subtitle")}
          </p>
        </div>
        <Button asChild size="lg" className="w-full lg:w-auto">
          <Link href="/sport-center-management/create">
            <Plus />
            {t("centerList.actions.create")}
          </Link>
        </Button>
      </section>

      {centersQuery.isLoading ? (
        <CenterListSkeleton />
      ) : centersQuery.isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <Building2 className="size-10 text-destructive" />
            <div className="space-y-1">
              <h2 className="font-semibold">{t("centerList.error.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("centerList.error.description")}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => centersQuery.refetch()}
            >
              <RefreshCw />
              {t("centerList.actions.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : centers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <Building2 className="size-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="font-semibold">{t("centerList.empty.title")}</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                {t("centerList.empty.description")}
              </p>
            </div>
            <Button asChild>
              <Link href="/sport-center-management/create">
                <Plus />
                {t("centerList.empty.action")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {centers.map((center) => (
            <SportCenterManagementCard
              key={center.id}
              center={center}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              deleting={
                deleteMutation.isPending && deleteTarget?.id === center.id
              }
              locale={locale}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("centerList.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("centerList.delete.description", {
                name: deleteTarget?.name ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t("centerList.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!deleteTarget || deleteMutation.isPending}
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
            >
              {deleteMutation.isPending
                ? t("centerList.actions.deleting")
                : t("centerList.actions.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open && !updateMutation.isPending) {
            setEditTarget(null)
            setEditForm(null)
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
              onClick={() => {
                setEditTarget(null)
                setEditForm(null)
              }}
              disabled={
                updateMutation.isPending ||
                editImagesUploading ||
                editQrUploading
              }
            >
              {t("centerList.actions.cancel")}
            </Button>
            <Button
              type="button"
              onClick={submitEdit}
              disabled={
                updateMutation.isPending ||
                editImagesUploading ||
                editQrUploading
              }
            >
              {updateMutation.isPending
                ? t("centerList.actions.saving")
                : t("centerList.actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingEditRemoval)}
        onOpenChange={(open) => !open && setPendingEditRemoval(null)}
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
    </div>
  )
}
