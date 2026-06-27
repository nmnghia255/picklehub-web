"use client"

import { Loader2, QrCode, Upload, User, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
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
import { submitPaymentProofAction } from "@/features/sport-center/actions/submit-payment-proof-action"
import { uploadImageAction } from "@/features/sport-center/actions/upload-image-action"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import {
  useBookingStore,
  useSelectedDateText,
  useTotalPrice,
  useTotalSlotsCount,
} from "../../stores/use-booking-store"

export default function ConfirmBookingDialog() {
  const { t } = useTournamentTranslation()
  const router = useRouter()

  // Store fields
  const tournamentId = useBookingStore((s) => s.tournamentId)
  const isConfirmDialogOpen = useBookingStore((s) => s.isConfirmDialogOpen)
  const setIsConfirmDialogOpen = useBookingStore(
    (s) => s.setIsConfirmDialogOpen
  )
  const playerName = useBookingStore((s) => s.playerName)
  const setPlayerName = useBookingStore((s) => s.setPlayerName)
  const phoneNumber = useBookingStore((s) => s.phoneNumber)
  const setPhoneNumber = useBookingStore((s) => s.setPhoneNumber)
  const isSubmitting = useBookingStore((s) => s.isSubmitting)
  const setSubmitting = useBookingStore((s) => s.setSubmitting)
  const submitBooking = useBookingStore((s) => s.submitBooking)
  const sportCenter = useBookingStore((s) => s.sportCenter)
  const file = useBookingStore((s) => s.file)
  const setFile = useBookingStore((s) => s.setFile)
  const previewUrl = useBookingStore((s) => s.previewUrl)
  const setPreviewUrl = useBookingStore((s) => s.setPreviewUrl)

  const selectedDateText = useSelectedDateText()
  const totalSlotsCount = useTotalSlotsCount()
  const totalPrice = useTotalPrice()

  // Revoke object URL on change/unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Reset file selection when dialog is closed
  useEffect(() => {
    if (!isConfirmDialogOpen) {
      setFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl("")
      }
    }
  }, [isConfirmDialogOpen, previewUrl, setFile, setPreviewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error(
          t("booking.page.invalidImage", {
            defaultValue: "Please select a valid image file",
          })
        )
        return
      }
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl("")
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setIsConfirmDialogOpen(false)
    }
  }

  const handleConfirmAndUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!playerName.trim() || !phoneNumber.trim()) {
      toast.error(
        t("booking.toasts.fillContactInfo", {
          defaultValue: "Please enter contact player name and phone number",
        })
      )
      return
    }

    if (!file) {
      toast.error(
        t("booking.toasts.noPaymentProof", {
          defaultValue: "Please select payment proof image",
        })
      )
      return
    }

    setSubmitting(true)
    let reservedBookingId: string | null = null

    try {
      // 1. Reserve court slots
      const bookingRes = await submitBooking()
      if (!bookingRes.success || !bookingRes.data) {
        throw new Error(bookingRes.error || "Failed to book court slots")
      }

      reservedBookingId = bookingRes.data.booking.externalBookingId

      // 2. Upload image to media server
      const imageUrl = await uploadImageAction(file)

      // 3. Submit payment proof
      await submitPaymentProofAction(reservedBookingId, imageUrl)

      toast.success(
        t("booking.page.uploadSuccess", {
          defaultValue:
            "Booking created and payment proof uploaded successfully!",
        })
      )
      setIsConfirmDialogOpen(false)
      if (tournamentId) {
        router.push(`/tournament-management/${tournamentId}?tab=bookings`)
        router.refresh()
      }
    } catch (err: unknown) {
      console.error("Booking error:", err)

      if (reservedBookingId) {
        // Slot is booked, but upload failed. Let user know they can finish upload in bookings tab
        toast.warning(
          t("booking.toasts.uploadFailedButReserved", {
            defaultValue:
              "Slots reserved successfully, but payment proof upload failed. Please submit proof in bookings history.",
          })
        )
        setIsConfirmDialogOpen(false)
        if (tournamentId) {
          router.push(`/tournament-management/${tournamentId}?tab=bookings`)
          router.refresh()
        }
      } else {
        // Reservation failed entirely
        toast.error(
          err instanceof Error
            ? err.message
            : t("booking.toasts.createFailed", {
                defaultValue: "Failed to book court slots",
              })
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isConfirmDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[95vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <User className="h-5.5 w-5.5 text-emerald-600" />
            {t("booking.page.confirmBtn", {
              defaultValue: "Confirm Booking & Submit Payment",
            })}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {t("booking.page.unifiedDesc", {
              defaultValue:
                "Enter contact details, perform bank transfer, and upload transfer receipt image below to complete reservation.",
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirmAndUpload} className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left column: Contact info and pricing/bank details */}
            <div className="space-y-5">
              {/* Form Input fields */}
              <div className="space-y-3.5">
                <h3 className="text-sm font-bold tracking-wider text-gray-700">
                  {t("booking.page.contactInfo", {
                    defaultValue: "Contact Information",
                  })}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="dialogPlayerName"
                      className="text-sm font-semibold text-gray-600"
                    >
                      {t("booking.form.playerName")}
                    </Label>
                    <Input
                      id="dialogPlayerName"
                      placeholder="e.g. John Doe"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="h-10 border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="dialogPhoneNumber"
                      className="text-sm font-semibold text-gray-600"
                    >
                      {t("booking.form.phone")}
                    </Label>
                    <Input
                      id="dialogPhoneNumber"
                      type="tel"
                      placeholder="e.g. 0912345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-10 border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Booking summary card */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold tracking-wider text-gray-700 uppercase">
                  {t("booking.page.bookingDetails", {
                    defaultValue: "Booking Details",
                  })}
                </h3>
                <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/50 p-3.5 text-sm text-gray-700 shadow-2xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      {t("booking.page.bookingDate", {
                        defaultValue: "Booking Date",
                      })}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {selectedDateText}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      {t("booking.page.slotsQuantity", {
                        defaultValue: "Number of slots",
                      })}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {t("booking.page.slotsCount", {
                        count: totalSlotsCount,
                        defaultValue: `${totalSlotsCount} slots`,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-bold text-gray-900">
                    <span>
                      {t("booking.page.totalPrice", {
                        defaultValue: "Total Price",
                      })}
                    </span>
                    <span className="text-emerald-700">
                      {formatCurrencyVnd(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank accounts info card */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold tracking-wider text-gray-700 uppercase">
                  {t("booking.page.bankInfo", {
                    defaultValue: "Transfer Information",
                  })}
                </h3>
                <div className="space-y-2.5 rounded-lg border border-emerald-100 bg-emerald-50/20 p-3.5 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-emerald-900/60">
                      {t("booking.page.bankName", {
                        defaultValue: "Bank Name",
                      })}
                    </span>
                    <span className="font-bold text-emerald-950">
                      {sportCenter?.paymentBankName || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-emerald-900/60">
                      {t("booking.page.accountNumber", {
                        defaultValue: "Account Number",
                      })}
                    </span>
                    <span className="font-bold text-emerald-950">
                      {sportCenter?.paymentAccountNumber || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-emerald-900/60">
                      {t("booking.page.accountName", {
                        defaultValue: "Account Name",
                      })}
                    </span>
                    <span className="font-bold text-emerald-950 uppercase">
                      {sportCenter?.paymentAccountName || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: QR code and Upload panel */}
            <div className="flex flex-col justify-between space-y-5">
              {/* QR display block */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50/40 p-4">
                {sportCenter?.paymentQrUrl ? (
                  <div className="group relative overflow-hidden rounded-xl border bg-white p-2 shadow-xs transition-all duration-300 hover:shadow-sm">
                    <img
                      src={sportCenter.paymentQrUrl}
                      alt="Sport center payment QR"
                      className="h-32 w-32 object-contain transition-transform duration-300 group-hover:scale-[1.025]"
                    />
                    <div className="mt-1.5 text-center text-[9px] font-bold tracking-wide text-gray-400 uppercase">
                      {t("booking.page.scanToPay", {
                        defaultValue: "Scan to Pay",
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-32 w-32 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 bg-white text-gray-400">
                    <QrCode className="h-6 w-6 stroke-[1.25]" />
                    <span className="text-[10px]">
                      {t("booking.page.noQr", {
                        defaultValue: "No QR Code Available",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Dropzone */}
              <div className="flex flex-1 flex-col justify-end space-y-2">
                <span className="text-sm font-bold tracking-wider text-gray-600 uppercase">
                  {t("booking.page.uploadProof", {
                    defaultValue: "Upload Proof Image",
                  })}
                </span>

                <div className="flex min-h-[140px] flex-1 flex-col justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {!previewUrl ? (
                      <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 py-3">
                        <div className="rounded-full bg-emerald-50 p-2.5 text-emerald-600 transition-colors hover:bg-emerald-100">
                          <Upload className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">
                          {t("booking.page.dragDrop", {
                            defaultValue: "Click to select or drag and drop",
                          })}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {t("booking.page.imageLimit", {
                            defaultValue: "PNG, JPG or WEBP (Max 5MB)",
                          })}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                          disabled={isSubmitting}
                          required
                        />
                      </label>
                    ) : (
                      <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-2">
                        <img
                          src={previewUrl}
                          alt={t("booking.page.preview", {
                            defaultValue: "Proof Image Preview",
                          })}
                          className="max-h-[130px] w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="absolute top-2 right-2 rounded-full bg-gray-900/60 p-1 text-white transition-colors hover:bg-gray-900/80"
                          disabled={isSubmitting}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {file && (
                  <div className="flex items-center justify-between rounded-lg border bg-white p-2 px-3 text-xs text-gray-500 shadow-2xs">
                    <span className="truncate font-medium text-gray-700">
                      {file.name}
                    </span>
                    <span className="ml-2 shrink-0 font-mono text-[10px] text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-2 border-t border-gray-100 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setIsConfirmDialogOpen(false)}
              className="h-10 border-gray-200 px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              {t("booking.cancelBtn", { defaultValue: "Cancel" })}
            </Button>
            <Button
              type="submit"
              size="default"
              className="h-10 bg-emerald-600 px-6 text-sm font-bold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
              disabled={
                isSubmitting ||
                !playerName.trim() ||
                !phoneNumber.trim() ||
                !file
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("booking.page.submitting", {
                    defaultValue: "Processing...",
                  })}
                </>
              ) : (
                t("booking.page.confirmAndBook", {
                  defaultValue: "Confirm Booking & Submit Payment",
                })
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
