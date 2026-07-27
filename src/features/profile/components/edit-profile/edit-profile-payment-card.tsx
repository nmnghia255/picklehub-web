"use client"

import {
  Check,
  Copy,
  CreditCard,
  Edit3,
  Hash,
  Landmark,
  Plus,
  QrCode,
  Trash2,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react"
import { type ChangeEvent, useRef, useState } from "react"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  createPaymentProfileAction,
  removePaymentProfileAction,
  updatePaymentProfileAction,
} from "@/features/profile/actions/payment-profile-actions"
import type { PaymentProfile } from "@/features/profile/types"
import { uploadImageAction } from "@/features/sport-center/actions/upload-image-action"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

interface EditProfilePaymentCardProps {
  initialPaymentProfiles?: PaymentProfile[]
}

export function EditProfilePaymentCard({
  initialPaymentProfiles = [],
}: EditProfilePaymentCardProps) {
  const { t } = useProfileTranslation()
  const [profiles, setProfiles] = useState<PaymentProfile[]>(
    initialPaymentProfiles
  )

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<PaymentProfile | null>(
    null
  )

  // Form state
  const [bankName, setBankName] = useState("")
  const [accountName, setAccountName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [qrUrl, setQrUrl] = useState("")

  // Loading states
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadingQr, setIsUploadingQr] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const openCreateDialog = () => {
    setEditingProfile(null)
    setBankName("")
    setAccountName("")
    setAccountNumber("")
    setQrUrl("")
    setIsDialogOpen(true)
  }

  const openEditDialog = (profile: PaymentProfile) => {
    setEditingProfile(profile)
    setBankName(profile.paymentBankName || "")
    setAccountName(profile.paymentAccountName || "")
    setAccountNumber(profile.paymentAccountNumber || "")
    setQrUrl(profile.paymentQrUrl || "")
    setIsDialogOpen(true)
  }

  const handleCopyAccountNumber = (
    text: string,
    id: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success(t("paymentProfile.accountNumber") + " copied!")
  }

  const handleQrUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      toast.error(t("paymentProfile.uploadError"))
      return
    }

    setIsUploadingQr(true)
    try {
      const uploadedUrl = await uploadImageAction(file)
      setQrUrl(uploadedUrl)
    } catch (err) {
      console.error(err)
      toast.error(t("paymentProfile.uploadError"))
    } finally {
      setIsUploadingQr(false)
      if (e.target) e.target.value = ""
    }
  }

  const handleSave = async () => {
    if (!bankName.trim() || !accountName.trim() || !accountNumber.trim()) {
      toast.error(t("paymentProfile.fillRequired"))
      return
    }

    setIsSaving(true)
    const payload = {
      paymentBankName: bankName.trim(),
      paymentAccountName: accountName.trim(),
      paymentAccountNumber: accountNumber.trim(),
      paymentQrUrl: qrUrl.trim(),
    }

    if (editingProfile) {
      // Update
      const res = await updatePaymentProfileAction(payload, editingProfile.id)
      if (res.success && res.paymentProfile) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === editingProfile.id ? res.paymentProfile! : p
          )
        )
        toast.success(t("paymentProfile.updateSuccess"))
        setIsDialogOpen(false)
      } else {
        toast.error(t("paymentProfile.error"))
      }
    } else {
      // Create
      const res = await createPaymentProfileAction(payload)
      if (res.success && res.paymentProfile) {
        setProfiles((prev) => [...prev, res.paymentProfile!])
        toast.success(t("paymentProfile.createSuccess"))
        setIsDialogOpen(false)
      } else {
        toast.error(t("paymentProfile.error"))
      }
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!editingProfile) return
    setIsDeleting(true)
    const res = await removePaymentProfileAction(editingProfile.id)
    if (res.success) {
      setProfiles((prev) => prev.filter((p) => p.id !== editingProfile.id))
      toast.success(t("paymentProfile.deleteSuccess"))
      setShowDeleteConfirm(false)
      setIsDialogOpen(false)
    } else {
      toast.error(t("paymentProfile.error"))
    }
    setIsDeleting(false)
  }

  return (
    <>
      <Card className="w-full border-gray-200 bg-white/95 shadow-md backdrop-blur-xs dark:border-gray-800 dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-foreground">
                {t("paymentProfile.title")}
              </CardTitle>
              <CardDescription>{t("paymentProfile.desc")}</CardDescription>
            </div>
          </div>
          <Button
            onClick={openCreateDialog}
            size="sm"
            className="flex items-center gap-1.5 bg-emerald-600 font-medium text-white transition-all hover:bg-emerald-700"
          >
            <Plus className="size-4" />
            {t("paymentProfile.add")}
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          {profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center dark:border-gray-800 dark:bg-muted/20">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CreditCard className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-foreground">
                {t("paymentProfile.emptyTitle")}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-muted-foreground">
                {t("paymentProfile.emptyDesc")}
              </p>
              <Button
                onClick={openCreateDialog}
                size="sm"
                className="mt-4 flex items-center gap-1.5 bg-emerald-600 font-medium text-white hover:bg-emerald-700"
              >
                <Plus className="size-4" />
                {t("paymentProfile.add")}
              </Button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-5">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => openEditDialog(profile)}
                  className="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-linear-to-br from-white to-gray-50/50 p-5 shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:from-gray-900 dark:to-gray-900/60"
                >
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-emerald-500 to-teal-600" />

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900 dark:text-foreground">
                          {profile.paymentBankName}
                        </h4>
                        <div className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-bold tracking-wide uppercase">
                            {profile.paymentAccountName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className="flex shrink-0 items-center gap-1.5 border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300"
                    >
                      <Edit3 className="size-3.5" />
                      {t("paymentProfile.clickToManage")}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span>{t("paymentProfile.accountNumber")}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="rounded bg-gray-200/80 px-3 py-1 font-mono text-base font-bold tracking-wider text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                        {profile.paymentAccountNumber}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full border border-gray-200 bg-white text-gray-600 shadow-2xs transition-all hover:bg-emerald-50/50 hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        onClick={(e) =>
                          handleCopyAccountNumber(
                            profile.paymentAccountNumber,
                            profile.id,
                            e
                          )
                        }
                        title={t("paymentProfile.copyAccountNumber")}
                      >
                        {copiedId === profile.id ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {profile.paymentQrUrl && (
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-medium text-emerald-700 dark:border-gray-800 dark:text-emerald-400">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{t("paymentProfile.hasQrCode")}</span>
                      </div>
                      <div className="size-8 overflow-hidden rounded border border-gray-200 bg-white shadow-2xs dark:border-gray-700 dark:bg-gray-800">
                        <img
                          src={profile.paymentQrUrl}
                          alt="QR Code"
                          className="size-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit / Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-foreground">
              <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Landmark className="size-4" />
              </div>
              {editingProfile
                ? t("paymentProfile.dialogEditTitle")
                : t("paymentProfile.dialogAddTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("paymentProfile.dialogDesc")}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-3.5 py-1">
            <Field className="gap-1.5">
              <FieldLabel
                htmlFor="bankName"
                className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300"
              >
                <Landmark className="h-4 w-4 text-emerald-600" />
                {t("paymentProfile.bankName")} *
              </FieldLabel>
              <Input
                id="bankName"
                placeholder={t("paymentProfile.bankNamePlaceholder")}
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="border-gray-300 focus-visible:ring-emerald-500"
              />
            </Field>

            <Field className="gap-1.5">
              <FieldLabel
                htmlFor="accountName"
                className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300"
              >
                <UserIcon className="h-4 w-4 text-emerald-600" />
                {t("paymentProfile.accountName")} *
              </FieldLabel>
              <Input
                id="accountName"
                placeholder={t("paymentProfile.accountNamePlaceholder")}
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="border-gray-300 font-semibold uppercase focus-visible:ring-emerald-500"
              />
            </Field>

            <Field className="gap-1.5">
              <FieldLabel
                htmlFor="accountNumber"
                className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300"
              >
                <Hash className="h-4 w-4 text-emerald-600" />
                {t("paymentProfile.accountNumber")} *
              </FieldLabel>
              <Input
                id="accountNumber"
                placeholder={t("paymentProfile.accountNumberPlaceholder")}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="border-gray-300 font-mono focus-visible:ring-emerald-500"
              />
            </Field>

            <Field className="gap-1.5">
              <FieldLabel className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                <QrCode className="h-4 w-4 text-emerald-600" />
                {t("paymentProfile.qrUrl")}
              </FieldLabel>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleQrUpload}
              />

              {qrUrl ? (
                <div className="relative flex flex-col items-center justify-center rounded-lg border bg-muted/30 p-3">
                  <img
                    src={qrUrl}
                    alt="Payment QR"
                    className="max-h-40 rounded object-contain"
                  />
                  <div className="mt-2.5 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingQr}
                    >
                      <Upload className="mr-1.5 size-3.5" />
                      {t("paymentProfile.qrChange")}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setQrUrl("")}
                    >
                      <X className="mr-1.5 size-3.5" />
                      {t("paymentProfile.qrRemove")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 p-4 text-center transition-colors hover:border-emerald-400 dark:border-gray-700 dark:bg-muted/20"
                >
                  {isUploadingQr ? (
                    <Spinner className="size-6 text-emerald-600" />
                  ) : (
                    <>
                      <div className="mb-1 rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <Upload className="size-5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t("paymentProfile.qrUpload")}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {t("paymentProfile.qrFormatHint")}
                      </p>
                    </>
                  )}
                </div>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="flex items-center justify-between gap-2 pt-2 sm:justify-between">
            {editingProfile ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSaving || isDeleting}
                className="flex items-center gap-1.5"
              >
                <Trash2 className="size-4" />
                {t("paymentProfile.delete")}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving || isDeleting}
              >
                {t("paymentProfile.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isDeleting}
                className="bg-emerald-600 font-medium text-white hover:bg-emerald-700"
              >
                {isSaving && <Spinner className="mr-2 size-4" />}
                {isSaving
                  ? t("paymentProfile.saving")
                  : t("paymentProfile.save")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("paymentProfile.deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("paymentProfile.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("paymentProfile.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Spinner className="mr-2 size-4" />
              ) : (
                <Trash2 className="mr-1.5 size-4" />
              )}
              {isDeleting
                ? t("paymentProfile.deleting")
                : t("paymentProfile.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
