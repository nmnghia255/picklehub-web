"use client"

import {
  Building2,
  Check,
  Copy,
  CreditCard,
  FileText,
  ImageIcon,
  Loader2,
  PenLine,
  QrCode,
  Upload,
  User,
  Wallet,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { updateSocialAction } from "../../../actions/social-form-actions"
import { MediaService } from "../../../api/media-service"
import type { SocialDetail, UpdateSocialRequest } from "../../../types/social"

export function PaymentInformationCard({
  social,
  showEditAction = true,
}: {
  social?: SocialDetail | null
  showEditAction?: boolean
}) {
  const { t } = useSocialsTranslation()
  const router = useRouter()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingQr, setIsUploadingQr] = useState(false)
  const [copied, setCopied] = useState(false)

  const accountNumber = social?.paymentAccountNumber
  const bankName = social?.paymentBankName
  const accountName = social?.paymentAccountName
  const paymentNote = social?.paymentNote
  const qrUrl = social?.paymentQrUrl

  const [editBankName, setEditBankName] = useState("")
  const [editAccountNumber, setEditAccountNumber] = useState("")
  const [editAccountName, setEditAccountName] = useState("")
  const [editQrUrl, setEditQrUrl] = useState("")
  const [editPaymentNote, setEditPaymentNote] = useState("")

  const qrFileInputRef = useRef<HTMLInputElement | null>(null)

  const handleOpenEdit = () => {
    setEditBankName(bankName || "")
    setEditAccountNumber(accountNumber || "")
    setEditAccountName(accountName || "")
    setEditQrUrl(qrUrl || "")
    setEditPaymentNote(paymentNote || "")
    setIsEditOpen(true)
  }

  useEffect(() => {
    if (isEditOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditBankName(bankName || "")
      setEditAccountNumber(accountNumber || "")
      setEditAccountName(accountName || "")
      setEditQrUrl(qrUrl || "")
      setEditPaymentNote(paymentNote || "")
    }
  }, [isEditOpen, bankName, accountNumber, accountName, qrUrl, paymentNote])

  const hasPaymentInfo = Boolean(
    accountNumber || bankName || accountName || paymentNote || qrUrl
  )

  const handleCopyAccount = () => {
    if (!accountNumber) return
    navigator.clipboard.writeText(accountNumber)
    setCopied(true)
    toast.success(t("expenses.paymentInfo.copied") || "Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error(t("form.paymentQrInvalidFile") || "Invalid image file")
      return
    }

    setIsUploadingQr(true)
    try {
      const uploadedUrl = await MediaService.uploadImage(file)
      setEditQrUrl(uploadedUrl)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("form.paymentQrUploadFailed")
      )
    } finally {
      setIsUploadingQr(false)
      e.target.value = ""
    }
  }

  const handleSave = async () => {
    if (!social?.id) return

    setIsSaving(true)
    try {
      const payload: UpdateSocialRequest = {
        paymentBankName: editBankName.trim() || null,
        paymentAccountNumber: editAccountNumber.trim() || null,
        paymentAccountName: editAccountName.trim() || null,
        paymentQrUrl: editQrUrl.trim() || null,
        paymentNote: editPaymentNote.trim() || null,
      }

      await updateSocialAction(social.id, payload)
      toast.success(t("expenses.paymentInfo.successUpdate"))
      setIsEditOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("expenses.paymentInfo.errorUpdate")
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border pb-0 shadow-xs">
        <CardHeader className="bg-linear-to-rto-transparent flex flex-row items-center justify-between border-b dark:via-teal-950/20 dark:to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Wallet className="size-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground">
                {t("expenses.paymentInfo.title")}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                {t("expenses.paymentInfo.description")}
              </CardDescription>
            </div>
          </div>

          {showEditAction && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
              type="button"
              onClick={handleOpenEdit}
            >
              <PenLine className="size-4" />
              {t("expenses.paymentInfo.edit")}
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          {!hasPaymentInfo ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-500/30 p-8 text-center dark:bg-emerald-950/20">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Wallet className="size-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("expenses.paymentInfo.noPaymentInfo")}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-[1fr_minmax(240px,300px)]">
                <div className="space-y-4">
                  {bankName && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-teal-500/5 p-4 transition-all hover:border-emerald-500/40 dark:from-emerald-950/30 dark:to-teal-950/10">
                      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                        <Building2 className="size-4" />
                        {t("expenses.paymentInfo.bankName")}
                      </div>
                      <p className="mt-2 text-base font-bold text-foreground">
                        {bankName}
                      </p>
                    </div>
                  )}

                  {accountNumber && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-teal-500/5 p-4 transition-all hover:border-emerald-500/40 dark:from-emerald-950/30 dark:to-teal-950/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                          <CreditCard className="size-4" />
                          {t("expenses.paymentInfo.accountNumber")}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400"
                          onClick={handleCopyAccount}
                          title={t("expenses.paymentInfo.copyAccountNumber")}
                        >
                          {copied ? (
                            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </Button>
                      </div>
                      <p className="mt-1 font-mono text-lg font-bold tracking-wide text-foreground">
                        {accountNumber}
                      </p>
                    </div>
                  )}

                  {accountName && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-teal-500/5 p-4 transition-all hover:border-emerald-500/40 dark:from-emerald-950/30 dark:to-teal-950/10">
                      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                        <User className="size-4" />
                        {t("expenses.paymentInfo.accountName")}
                      </div>
                      <p className="mt-2 text-base font-bold text-foreground">
                        {accountName}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-500/20 bg-linear-to-br via-teal-500/5 to-transparent p-4 text-center dark:via-teal-950/20">
                  <div className="relative flex aspect-square w-full max-w-60 items-center justify-center overflow-hidden rounded-xl border border-emerald-500/15 bg-background/80 p-2 shadow-inner">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={t("expenses.paymentInfo.qrPreviewLabel")}
                        className="h-full w-full rounded-lg object-contain"
                      />
                    ) : (
                      <div className="grid w-full grid-cols-6 gap-1 p-2">
                        {Array.from({ length: 36 }).map((_, index) => (
                          <span
                            key={index}
                            className={`aspect-square rounded-[3px] ${
                              index % 2 === 0 || index % 7 === 0
                                ? "bg-emerald-600 dark:bg-emerald-400"
                                : "bg-emerald-500/20"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <QrCode className="size-4" />
                    <span>{t("expenses.paymentInfo.qrPreviewLabel")}</span>
                  </div>
                </div>
              </div>

              {paymentNote && (
                <div className="rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-teal-500/5 p-4 dark:from-emerald-950/20 dark:to-teal-950/10">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                    <FileText className="size-4" />
                    {t("expenses.paymentInfo.paymentNote")}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed font-medium whitespace-pre-line text-foreground">
                    {paymentNote}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-emerald-500/20 sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <PenLine className="size-5 text-emerald-600 dark:text-emerald-400" />
              {t("expenses.paymentInfo.editTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("expenses.paymentInfo.editDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="bankName" className="text-xs font-semibold">
                {t("expenses.paymentInfo.bankName")}
              </Label>
              <Input
                id="bankName"
                value={editBankName}
                onChange={(e) => setEditBankName(e.target.value)}
                placeholder={t("form.bankNamePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber" className="text-xs font-semibold">
                {t("expenses.paymentInfo.accountNumber")}
              </Label>
              <Input
                id="accountNumber"
                value={editAccountNumber}
                onChange={(e) => setEditAccountNumber(e.target.value)}
                placeholder={t("form.accountNumberPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName" className="text-xs font-semibold">
                {t("expenses.paymentInfo.accountName")}
              </Label>
              <Input
                id="accountName"
                value={editAccountName}
                onChange={(e) => setEditAccountName(e.target.value)}
                placeholder={t("form.accountNamePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                {t("expenses.paymentInfo.qrPreviewLabel")}
              </Label>
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-3 dark:bg-emerald-950/20">
                {editQrUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-lg border border-emerald-500/20 bg-background p-1">
                      <img
                        src={editQrUrl}
                        alt="QR preview"
                        className="size-full object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setEditQrUrl("")}
                    >
                      <X className="mr-1 size-4" />
                      {t("expenses.paymentInfo.removeQr")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <ImageIcon className="size-5" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                      disabled={isUploadingQr}
                      onClick={() => qrFileInputRef.current?.click()}
                    >
                      {isUploadingQr ? (
                        <Loader2 className="mr-1 size-4 animate-spin" />
                      ) : (
                        <Upload className="mr-1 size-4" />
                      )}
                      {t("expenses.paymentInfo.uploadQr")}
                    </Button>
                  </div>
                )}
                <input
                  ref={qrFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleQrUpload}
                  disabled={isUploadingQr}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentNote" className="text-xs font-semibold">
                {t("expenses.paymentInfo.paymentNote")}
              </Label>
              <Textarea
                id="paymentNote"
                rows={3}
                value={editPaymentNote}
                onChange={(e) => setEditPaymentNote(e.target.value)}
                placeholder={t("form.paymentNotePlaceholder")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSaving}
            >
              {t("expenses.paymentInfo.cancel")}
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("expenses.paymentInfo.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
