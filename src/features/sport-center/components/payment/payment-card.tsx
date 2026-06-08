"use client"

import { Landmark } from "lucide-react"
import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

import BankTransferProof from "./bank-transfer-proof"
import CreditPaymentInfo from "./credit-payment-info"
import PaymentBankInfo from "./payment-bank-info"

type BookingConfirmationPaymentCardProps = {
  paymentAccountName: string
  paymentBankName: string
  paymentAccountNumber: string
  paymentQrUrl: string
  totalAmount: number
  creditBalance: number | null
  creditLoading: boolean
  creditError: string
  canConfirm: boolean
  isSubmitting: boolean
  isUploadingProof: boolean
  submitMessage: string
  submitError: string
  hasCreatedBooking: boolean
  onProofSelected: (paymentProofFile: File | null) => void | Promise<void>
  onConfirm: () => void | Promise<void>
}

export function BookingConfirmationPaymentCard({
  paymentAccountName,
  paymentBankName,
  paymentAccountNumber,
  paymentQrUrl,
  totalAmount,
  creditBalance,
  creditLoading,
  creditError,
  canConfirm,
  isSubmitting,
  isUploadingProof,
  submitMessage,
  submitError,
  hasCreatedBooking,
  onProofSelected,
  onConfirm,
}: BookingConfirmationPaymentCardProps) {
  const { t } = useSportCenterTranslation()
  const useCredit = useBookingStore((state) => state.useCredit)
  const availableCredit = creditBalance ?? 0
  const isCreditInsufficient = useCredit && availableCredit < totalAmount
  const requiresProof = !useCredit || isCreditInsufficient
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [paymentProofPreviewUrl, setPaymentProofPreviewUrl] = useState("")
  const [paymentProofError, setPaymentProofError] = useState("")
  const [isPreparingProof, setIsPreparingProof] = useState(false)
  const loadingToastId = useRef<string | number | undefined>(undefined)
  const wasSubmitting = useRef(false)

  useEffect(() => {
    return () => {
      if (paymentProofPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(paymentProofPreviewUrl)
      }
    }
  }, [paymentProofPreviewUrl])

  useEffect(() => {
    if (isSubmitting && !wasSubmitting.current) {
      loadingToastId.current = toast.loading(
        t("booking.payment.submittingPayment")
      )
    }

    if (!isSubmitting && wasSubmitting.current && loadingToastId.current) {
      toast.dismiss(loadingToastId.current)
      loadingToastId.current = undefined
    }

    wasSubmitting.current = isSubmitting
  }, [isSubmitting])

  useEffect(() => {
    if (!submitMessage) return

    if (loadingToastId.current) {
      toast.dismiss(loadingToastId.current)
      loadingToastId.current = undefined
    }

    toast.success(t("booking.payment.successTitle"), {
      description: submitMessage,
    })
  }, [submitMessage])

  useEffect(() => {
    if (!submitError) return

    if (loadingToastId.current) {
      toast.dismiss(loadingToastId.current)
      loadingToastId.current = undefined
    }

    toast.error(t("booking.payment.errorTitle"), {
      description: submitError,
    })
  }, [submitError])

  const handlePaymentProofChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    setPaymentProofError("")

    if (paymentProofPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(paymentProofPreviewUrl)
    }

    if (!file) {
      setPaymentProofFile(null)
      setPaymentProofPreviewUrl("")
      return
    }

    if (!file.type.startsWith("image/")) {
      setPaymentProofFile(null)
      setPaymentProofPreviewUrl("")
      setPaymentProofError(t("booking.payment.invalidImage"))
      return
    }

    setPaymentProofFile(file)
    setPaymentProofPreviewUrl(URL.createObjectURL(file))

    void onProofSelected(file)
  }

  const handleConfirm = async () => {
    try {
      if (requiresProof && !paymentProofFile) {
        setPaymentProofError(t("booking.payment.uploadProof"))
        return
      }

      await onConfirm()
    } catch (error) {
      setPaymentProofError(
        error instanceof Error
          ? error.message
          : t("booking.payment.errorProcessingProof")
      )
    } finally {
      setIsPreparingProof(false)
    }
  }

  return (
    <Card className="border shadow-lg shadow-black/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Landmark className="size-5" />
          {t("booking.payment.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <PaymentBankInfo
          paymentQrUrl={paymentQrUrl ?? ""}
          paymentBankName={paymentBankName}
          paymentAccountName={paymentAccountName}
          paymentAccountNumber={paymentAccountNumber}
        />

        {useCredit ? (
          <CreditPaymentInfo
            creditBalance={creditBalance}
            totalAmount={totalAmount}
            creditLoading={creditLoading}
            creditError={creditError}
          />
        ) : null}

        {requiresProof ? (
          <BankTransferProof
            paymentProofFile={paymentProofFile}
            paymentProofPreviewUrl={paymentProofPreviewUrl}
            paymentProofError={paymentProofError}
            onFileChange={handlePaymentProofChange}
            onRemoveFile={() => {
              if (paymentProofPreviewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(paymentProofPreviewUrl)
              }
              setPaymentProofFile(null)
              setPaymentProofPreviewUrl("")
            }}
          />
        ) : null}

        <Button
          className="w-full"
          onClick={() => void handleConfirm()}
          disabled={
            !canConfirm ||
            isSubmitting ||
            isUploadingProof ||
            hasCreatedBooking ||
            isPreparingProof ||
            (requiresProof && !paymentProofFile)
          }
        >
          {isSubmitting || isPreparingProof || isUploadingProof ? (
            <>
              <Spinner className="mr-2 size-4" />
              {isUploadingProof
                ? t("booking.payment.uploadingProof")
                : isPreparingProof
                  ? t("booking.payment.readingProof")
                  : t("booking.payment.loading")}
            </>
          ) : (
            t("booking.payment.confirm")
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
