"use client"

import {
  Check,
  Copy,
  CreditCard,
  FileText,
  Hash,
  Landmark,
  Loader2,
  QrCode,
  Upload,
  User,
  X,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { PaymentSelector } from "@/components/common/payment-selector"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { uploadImageAction } from "@/features/sport-center/actions/upload-image-action"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { updateTournamentAction } from "../../actions/tournament-actions"
import type { Tournament, TournamentRequest } from "../../types/tournament"

interface PaymentTabProps {
  tournament: Tournament
  isHost: boolean
  isEditable: boolean
}

export function PaymentTab({
  tournament,
  isHost,
  isEditable,
}: PaymentTabProps) {
  const { t } = useTournamentTranslation()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Form states
  const [bankName, setBankName] = useState(tournament.paymentBankName || "")
  const [accountName, setAccountName] = useState(
    tournament.paymentAccountName || ""
  )
  const [accountNumber, setAccountNumber] = useState(
    tournament.paymentAccountNumber || ""
  )
  const [qrUrl, setQrUrl] = useState(tournament.paymentQrUrl || "")
  const [note, setNote] = useState(tournament.paymentNote || "")

  const [isUploading, setIsUploading] = useState(false)

  const handleCopy = () => {
    if (!tournament.paymentAccountNumber) return
    navigator.clipboard.writeText(tournament.paymentAccountNumber)
    setCopied(true)
    toast.success(
      t("paymentTab.copied", { defaultValue: "Copied to clipboard!" })
    )
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error(
        t("eventDetail.selectImageError", {
          defaultValue: "Please select an image file",
        })
      )
      return
    }

    setIsUploading(true)
    try {
      const url = await uploadImageAction(file)
      setQrUrl(url)
      toast.success(
        t("sponsors.dialog.paymentQrUploaded", {
          defaultValue: "QR code uploaded successfully!",
        })
      )
    } catch (error) {
      console.error(error)
      toast.error(
        t("sponsors.dialog.paymentQrUploadFailed", {
          defaultValue: "Failed to upload QR code image.",
        })
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveQr = () => {
    setQrUrl("")
  }

  const handleSave = async () => {
    if (!bankName.trim() || !accountName.trim() || !accountNumber.trim()) {
      toast.error(
        t("create.validation.requiredFields", {
          defaultValue: "Please fill in all required fields marked with *",
        })
      )
      return
    }

    const payload: TournamentRequest = {
      name: tournament.name,
      venue: tournament.venue,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      banner: tournament.banner,
      description: tournament.description,
      registrationStartDate: tournament.registrationStartDate,
      registrationEndDate: tournament.registrationEndDate,
      // Updated payment details
      paymentBankName: bankName,
      paymentAccountName: accountName,
      paymentAccountNumber: accountNumber,
      paymentQrUrl: qrUrl,
      paymentNote: note,
    }

    startTransition(async () => {
      const res = await updateTournamentAction(
        tournament.id.toString(),
        payload
      )
      if (res.success) {
        toast.success(
          t("paymentTab.saveSuccess", {
            defaultValue: "Payment details updated successfully!",
          })
        )
        setIsEditing(false)
        router.refresh()
      } else {
        toast.error(
          res.error ||
            t("paymentTab.saveError", {
              defaultValue: "Failed to update payment details.",
            })
        )
      }
    })
  }

  const handleCancel = () => {
    // Reset values to original props
    setBankName(tournament.paymentBankName || "")
    setAccountName(tournament.paymentAccountName || "")
    setAccountNumber(tournament.paymentAccountNumber || "")
    setQrUrl(tournament.paymentQrUrl || "")
    setNote(tournament.paymentNote || "")
    setIsEditing(false)
  }

  const hasPaymentInfo = !!(
    tournament.paymentBankName ||
    tournament.paymentAccountName ||
    tournament.paymentAccountNumber ||
    tournament.paymentQrUrl
  )

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Panel */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-semibold text-gray-900">
              {isEditing
                ? t("paymentTab.title", { defaultValue: "Payment Settings" })
                : t("paymentTab.viewTitle", {
                    defaultValue: "Payment Information",
                  })}
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? t("paymentTab.subtitle", {
                    defaultValue:
                      "Manage bank transfer info and payment instructions for this tournament.",
                  })
                : t("paymentTab.viewSubtitle", {
                    defaultValue:
                      "Transfer registration fees to the organizer using the details below.",
                  })}
            </p>
          </div>

          {isEditable && !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-emerald-600 font-medium text-white transition-all hover:bg-emerald-700 md:w-auto"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {t("paymentTab.editButton", {
                defaultValue: "Edit Payment Details",
              })}
            </Button>
          )}
        </div>

        {isEditing ? (
          <Card className="border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-medium text-gray-900">
                {t("paymentTab.title", { defaultValue: "Payment Settings" })}
              </CardTitle>
              <CardDescription>
                {t("paymentTab.subtitle", {
                  defaultValue:
                    "Manage bank transfer info and payment instructions for this tournament.",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <PaymentSelector
                onSelectProfile={(selected) => {
                  setBankName(selected.paymentBankName)
                  setAccountName(selected.paymentAccountName)
                  setAccountNumber(selected.paymentAccountNumber)
                  if (selected.paymentQrUrl) {
                    setQrUrl(selected.paymentQrUrl)
                  }
                }}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Form Input Side */}
                <div className="space-y-4">
                  {/* Bank Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="payment-bank-name"
                      className="flex items-center gap-2 font-medium text-gray-700"
                    >
                      <Landmark className="h-4 w-4 text-emerald-600" />
                      {t("create.step5.bankNameLabel", {
                        defaultValue: "Bank Name *",
                      })}
                    </Label>
                    <Input
                      id="payment-bank-name"
                      placeholder={t("create.step5.bankNamePlaceholder", {
                        defaultValue: "e.g., Vietcombank",
                      })}
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="border-gray-300 focus-visible:ring-emerald-500"
                    />
                  </div>

                  {/* Account Holder Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="payment-account-name"
                      className="flex items-center gap-2 font-medium text-gray-700"
                    >
                      <User className="h-4 w-4 text-emerald-600" />
                      {t("create.step5.accountNameLabel", {
                        defaultValue: "Account Holder Name *",
                      })}
                    </Label>
                    <Input
                      id="payment-account-name"
                      placeholder={t("create.step5.accountNamePlaceholder", {
                        defaultValue: "e.g., NGUYEN VAN AN",
                      })}
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="border-gray-300 font-semibold uppercase focus-visible:ring-emerald-500"
                    />
                  </div>

                  {/* Account Number */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="payment-account-number"
                      className="flex items-center gap-2 font-medium text-gray-700"
                    >
                      <Hash className="h-4 w-4 text-emerald-600" />
                      {t("create.step5.accountNumberLabel", {
                        defaultValue: "Account Number *",
                      })}
                    </Label>
                    <Input
                      id="payment-account-number"
                      placeholder={t("create.step5.accountNumberPlaceholder", {
                        defaultValue: "e.g., 1023456789",
                      })}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="border-gray-300 font-mono focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* QR Upload Side */}
                <div className="flex flex-col">
                  <Label className="mb-2 flex items-center gap-2 font-medium text-gray-700">
                    <QrCode className="h-4 w-4 text-emerald-600" />
                    {t("create.step5.qrUrlLabel", {
                      defaultValue: "QR Code Image (optional)",
                    })}
                  </Label>
                  <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 text-center transition-all hover:border-emerald-400">
                    {qrUrl ? (
                      <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                        <Image
                          src={qrUrl}
                          alt={t("common.previewImageAlt")}
                          fill
                          sizes="160px"
                          className="object-contain p-2"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={handleRemoveQr}
                          disabled={isUploading}
                          className="absolute top-1 right-1 rounded-full bg-red-600/90 p-1.5 text-white shadow-md transition-all hover:scale-105 hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : isUploading ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        <span className="text-sm font-medium text-gray-500">
                          {t("common.loading", {
                            defaultValue: "Uploading QR Code...",
                          })}
                        </span>
                      </div>
                    ) : (
                      <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center space-y-3 py-6">
                        <div className="rounded-full bg-emerald-50 p-3 text-emerald-600 transition-colors hover:bg-emerald-100">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-700">
                            {t("create.step5.qrUrlPlaceholder", {
                              defaultValue: "Click to upload QR code image",
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Note Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="payment-note"
                  className="flex items-center gap-2 font-medium text-gray-700"
                >
                  <FileText className="h-4 w-4 text-emerald-600" />
                  {t("create.step5.noteLabel", {
                    defaultValue: "Payment Note / Instructions (optional)",
                  })}
                </Label>
                <Textarea
                  id="payment-note"
                  placeholder={t("create.step5.notePlaceholder", {
                    defaultValue:
                      "e.g., Please enter [Registration ID] as transfer comment.",
                  })}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[100px] border-gray-300 focus-visible:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending || isUploading}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  {t("paymentTab.cancelButton", { defaultValue: "Cancel" })}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isPending || isUploading}
                  className="min-w-[120px] bg-emerald-600 font-medium text-white hover:bg-emerald-700"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.saving", { defaultValue: "Saving..." })}
                    </>
                  ) : (
                    t("paymentTab.saveButton", { defaultValue: "Save Changes" })
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : !hasPaymentInfo ? (
          <Card className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
            <div className="mb-4 animate-pulse rounded-full bg-emerald-50 p-4 text-emerald-600">
              <CreditCard className="h-8 w-8" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              {t("paymentTab.noInfoTitle", {
                defaultValue: "No Payment Details",
              })}
            </h3>
            <p className="mb-6 max-w-sm text-sm text-gray-500">
              {isEditable
                ? t("paymentTab.noInfoDescHost", {
                    defaultValue:
                      "Please add your payment information to allow participants to pay registration fees.",
                  })
                : t("paymentTab.noInfoDescPlayer", {
                    defaultValue:
                      "The tournament organizer has not configured payment details yet. Please contact them directly.",
                  })}
            </p>
            {isEditable && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-emerald-600 font-medium text-white transition-all hover:bg-emerald-700"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {t("paymentTab.editButton", {
                  defaultValue: "Edit Payment Details",
                })}
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bank Details & Notes (Left & Center Columns) */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="overflow-hidden border-gray-200 bg-linear-to-br from-white to-gray-50/50 shadow-md transition-all duration-300 hover:shadow-lg">
                <div className="h-1.5 bg-linear-to-r from-emerald-500 to-teal-600" />
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {t("paymentTab.bankDetailsTitle", {
                          defaultValue: "Bank Details",
                        })}
                      </CardTitle>
                      <CardDescription>
                        {t("paymentTab.bankDetailsDesc", {
                          defaultValue:
                            "Official bank transfer info for registration fees.",
                        })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="divide-y divide-gray-100">
                  <div className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center">
                    <span className="flex items-center gap-2 text-base font-medium text-gray-500">
                      <Landmark className="h-5 w-5 text-gray-400" />
                      {t("paymentTab.bankName", { defaultValue: "Bank Name" })}
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {tournament.paymentBankName}
                    </span>
                  </div>
                  <div className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center">
                    <span className="flex items-center gap-2 text-base font-medium text-gray-500">
                      <User className="h-5 w-5 text-gray-400" />
                      {t("paymentTab.accountName", {
                        defaultValue: "Account Name",
                      })}
                    </span>
                    <span className="text-base font-bold tracking-wide text-gray-900 uppercase">
                      {tournament.paymentAccountName}
                    </span>
                  </div>
                  <div className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center">
                    <span className="flex items-center gap-2 text-base font-medium text-gray-500">
                      <Hash className="h-5 w-5 text-gray-400" />
                      {t("paymentTab.accountNumber", {
                        defaultValue: "Account Number",
                      })}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-gray-200/80 px-2.5 py-1 text-base font-bold text-gray-900">
                        {tournament.paymentAccountNumber}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCopy}
                              className="h-8 w-8 rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-emerald-50/50 hover:text-emerald-600"
                            >
                              {copied ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {t("paymentTab.copyTooltip", {
                                defaultValue: "Copy Account Number",
                              })}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Note / Instructions Card */}
              <Card className="gap-0 overflow-hidden border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-50 text-emerald-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {t("paymentTab.instructions", {
                        defaultValue: "Transfer Instructions",
                      })}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {tournament.paymentNote ? (
                    <div className="prose prose-emerald max-w-none leading-relaxed break-words whitespace-pre-wrap text-gray-700">
                      {tournament.paymentNote}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                      <FileText className="h-4 w-4 text-gray-400" />
                      {t("paymentTab.defaultNote", {
                        defaultValue:
                          "Please transfer the registration fee with your Registration ID or Full Name as the transaction note.",
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* QR Code Card (Right Column) */}
            <div className="space-y-6">
              <Card className="flex flex-col overflow-hidden border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg">
                <div className="h-1.5 bg-linear-to-r from-teal-500 to-emerald-600" />
                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {t("paymentTab.qrCode", { defaultValue: "QR Code" })}
                  </CardTitle>
                  <CardDescription>
                    {tournament.paymentQrUrl
                      ? t("paymentTab.qrDesc", {
                          defaultValue:
                            "Scan the QR code to make a direct transfer.",
                        })
                      : t("paymentTab.noQrCode", {
                          defaultValue: "No QR Code uploaded",
                        })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col items-center justify-center p-6 pt-2">
                  {tournament.paymentQrUrl ? (
                    <div className="group/qr relative flex flex-col items-center">
                      <div className="relative h-64 w-64 rounded-xl border border-gray-200 bg-white shadow-lg transition-transform duration-300 hover:scale-[1.02]">
                        <Image
                          src={tournament.paymentQrUrl}
                          alt={t("common.previewImageAlt")}
                          fill
                          sizes="256px"
                          className="object-contain p-0"
                          unoptimized
                        />
                      </div>

                      <a
                        href={tournament.paymentQrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                      >
                        <QrCode className="h-4 w-4" />
                        {t("paymentTab.viewFullImage", {
                          defaultValue: "Open Full QR Image",
                        })}
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                      <QrCode className="mb-4 h-16 w-16 stroke-1" />
                      <p className="text-sm font-medium">
                        {t("paymentTab.noQrAvailable", {
                          defaultValue:
                            "Scan QR code is not available for this event.",
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
