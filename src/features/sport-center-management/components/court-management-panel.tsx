"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Edit3, MoreHorizontal, Plus, RefreshCw, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
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
import { useSportCenterManagementTranslation } from "@/i18n/use-sport-center-management-translation"

import { sportCenterWizardClient } from "../api/sport-center-wizard-client"
import type {
  CourtLifecycleStatus,
  CourtResponse,
  CourtType,
  CreateCourtRequest,
  UpdateCourtRequest,
} from "../types/court"

export const sportCenterCourtsQueryKey = (centerId: string) => [
  "sport-center-management",
  "courts",
  centerId,
]

type CourtFormState = {
  name: string
  type: CourtType
  status: CourtLifecycleStatus
}

const emptyForm: CourtFormState = {
  name: "",
  type: "INDOOR",
  status: "ACTIVE",
}

function getStatusKey(status: string) {
  if (status === "ACTIVE") return "active"
  if (status === "MAINTENANCE") return "maintenance"
  if (status === "ARCHIVED") return "archived"
  return "inactive"
}

function formatCourtDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(value)
  )
}

function CourtListSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-3 p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-9 w-full animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function CourtManagementPanel({
  centerId,
  initialCourts,
}: {
  centerId: string
  initialCourts?: CourtResponse[]
}) {
  const { t } = useSportCenterManagementTranslation()
  const { i18n } = useTranslation("sport-center-management")
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<CourtResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CourtResponse | null>(null)
  const [form, setForm] = useState<CourtFormState>(emptyForm)

  const courtsQuery = useQuery({
    queryKey: sportCenterCourtsQueryKey(centerId),
    queryFn: () => sportCenterWizardClient.listCourts(centerId),
    enabled: Boolean(centerId),
    initialData: initialCourts,
    staleTime: 30_000,
  })

  const invalidateCourts = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: sportCenterCourtsQueryKey(centerId),
      }),
      queryClient.invalidateQueries({
        queryKey: ["sport-center-management", "detail", centerId],
      }),
    ])
  }

  const createMutation = useMutation({
    mutationFn: (request: CreateCourtRequest) =>
      sportCenterWizardClient.createCourt(centerId, request),
    onSuccess: async () => {
      await invalidateCourts()
      setFormOpen(false)
      toast.success(t("courtManagement.toast.created"))
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("courtManagement.toast.createFailed")
      )
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      courtId,
      request,
    }: {
      courtId: string
      request: UpdateCourtRequest
    }) => sportCenterWizardClient.updateCourt(centerId, courtId, request),
    onSuccess: async () => {
      await invalidateCourts()
      setFormOpen(false)
      setEditingCourt(null)
      toast.success(t("courtManagement.toast.updated"))
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("courtManagement.toast.updateFailed")
      )
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (courtId: string) =>
      sportCenterWizardClient.deleteCourt(centerId, courtId),
    onSuccess: async () => {
      await invalidateCourts()
      setDeleteTarget(null)
      toast.success(t("courtManagement.toast.archived"))
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("courtManagement.toast.archiveFailed")
      )
    },
  })

  const openCreate = () => {
    setEditingCourt(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (court: CourtResponse) => {
    setEditingCourt(court)
    setForm({
      name: court.name,
      type: court.type,
      status:
        court.status === "MAINTENANCE" || court.status === "ARCHIVED"
          ? court.status
          : "ACTIVE",
    })
    setFormOpen(true)
  }

  const submitForm = () => {
    const name = form.name.trim()
    if (!name) {
      toast.error(t("courtManagement.validation.nameRequired"))
      return
    }

    if (editingCourt) {
      updateMutation.mutate({
        courtId: editingCourt.id,
        request: { name, type: form.type, status: form.status },
      })
      return
    }

    createMutation.mutate({ name, type: form.type, status: form.status })
  }

  const isSaving = createMutation.isPending || updateMutation.isPending
  const courts = courtsQuery.data ?? []
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US"

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {t("courtManagement.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("courtManagement.subtitle")}
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus />
          {t("courtManagement.actions.add")}
        </Button>
      </div>

      {courtsQuery.isLoading ? (
        <CourtListSkeleton />
      ) : courtsQuery.isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-sm text-destructive">
              {t("courtManagement.error.load")}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => courtsQuery.refetch()}
            >
              <RefreshCw />
              {t("courtManagement.actions.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : courts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="rounded-2xl bg-primary/10 p-4 text-primary">
              <Plus className="size-7" />
            </div>
            <h3 className="font-semibold">
              {t("courtManagement.empty.title")}
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              {t("courtManagement.empty.description")}
            </p>
            <Button type="button" onClick={openCreate}>
              <Plus />
              {t("courtManagement.actions.addFirst")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {courts.map((court) => {
            const archived = court.status === "ARCHIVED"
            return (
              <Card key={court.id}>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{court.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`courtManagement.types.${court.type}`)}
                      </p>
                    </div>
                    <Badge variant={archived ? "secondary" : "default"}>
                      {t(
                        `courtManagement.status.${getStatusKey(court.status)}`
                      )}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("courtManagement.updated", {
                      date: formatCourtDate(court.updatedAt, locale),
                    })}
                  </div>
                  <div className="flex gap-2 border-t pt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(court)}
                      disabled={archived}
                    >
                      <Edit3 />
                      {t("courtManagement.actions.edit")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(court)}
                      disabled={archived || archiveMutation.isPending}
                    >
                      {archiveMutation.isPending ? (
                        <MoreHorizontal className="animate-pulse" />
                      ) : (
                        <Trash2 />
                      )}
                      {t("courtManagement.actions.archive")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open && !isSaving) setFormOpen(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCourt
                ? t("courtManagement.form.editTitle")
                : t("courtManagement.form.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("courtManagement.form.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="court-name">
                {t("courtManagement.fields.name")}
              </Label>
              <Input
                id="court-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder={t("courtManagement.fields.namePlaceholder")}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="court-type">
                {t("courtManagement.fields.type")}
              </Label>
              <select
                id="court-type"
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as CourtType,
                  }))
                }
                disabled={isSaving}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="INDOOR">
                  {t("courtManagement.types.INDOOR")}
                </option>
                <option value="OUTDOOR">
                  {t("courtManagement.types.OUTDOOR")}
                </option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="court-status">
                {t("courtManagement.fields.status")}
              </Label>
              <select
                id="court-status"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as CourtLifecycleStatus,
                  }))
                }
                disabled={isSaving}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ACTIVE">
                  {t("courtManagement.status.active")}
                </option>
                <option value="MAINTENANCE">
                  {t("courtManagement.status.maintenance")}
                </option>
                <option value="ARCHIVED">
                  {t("courtManagement.status.archived")}
                </option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={isSaving}
            >
              {t("courtManagement.actions.cancel")}
            </Button>
            <Button type="button" onClick={submitForm} disabled={isSaving}>
              {isSaving
                ? t("courtManagement.actions.saving")
                : t("courtManagement.actions.save")}
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
              {t("courtManagement.archive.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("courtManagement.archive.description", {
                name: deleteTarget?.name ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveMutation.isPending}>
              {t("courtManagement.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!deleteTarget || archiveMutation.isPending}
              onClick={() =>
                deleteTarget && archiveMutation.mutate(deleteTarget.id)
              }
            >
              {archiveMutation.isPending
                ? t("courtManagement.actions.archiving")
                : t("courtManagement.actions.confirmArchive")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
