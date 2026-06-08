"use client"

import { Landmark } from "lucide-react"
import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

import BankTransferProof from "../payment/bank-transfer-proof"
import CreditPaymentInfo from "../payment/credit-payment-info"
import PaymentBankInfo from "../payment/payment-bank-info"
import PaymentMethodSelector from "./payment-method-selector"

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
  submitMessage: string
  submitError: string
  hasCreatedBooking: boolean
  onConfirm: (paymentProofFile: File | null) => void | Promise<void>
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
  submitMessage,
  submitError,
  hasCreatedBooking,
  onConfirm,
}: BookingConfirmationPaymentCardProps) {
  const { t } = useSportCenterTranslation()
  const useCredit = useBookingStore((state) => state.useCredit)
  const setUseCredit = useBookingStore((state) => state.setUseCredit)
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
  }, [isSubmitting, t])

  useEffect(() => {
    if (!submitMessage) return

    if (loadingToastId.current) {
      toast.dismiss(loadingToastId.current)
      loadingToastId.current = undefined
    }

    toast.success(t("booking.payment.successTitle"), {
      description: submitMessage,
    })
  }, [submitMessage, t])

  useEffect(() => {
    if (!submitError) return

    if (loadingToastId.current) {
      toast.dismiss(loadingToastId.current)
      loadingToastId.current = undefined
    }

    toast.error(t("booking.payment.errorTitle"), {
      description: submitError,
    })
  }, [submitError, t])

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
  }

  const handleConfirm = async () => {
    try {
      if (!useCredit && !paymentProofFile) {
        setPaymentProofError(t("booking.payment.uploadProof"))
        return
      }

      // Pass the File to parent; parent will upload it if needed
      await onConfirm(paymentProofFile ?? null)
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

        <PaymentMethodSelector
          useCredit={useCredit}
          setUseCredit={setUseCredit}
        />

        {useCredit ? (
          <CreditPaymentInfo
            creditBalance={creditBalance}
            totalAmount={totalAmount}
            creditLoading={creditLoading}
            creditError={creditError}
          />
        ) : (
          <>
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
          </>
        )}

        <Button
          className="w-full"
          onClick={() => void handleConfirm()}
          disabled={
            !canConfirm ||
            isSubmitting ||
            hasCreatedBooking ||
            isPreparingProof ||
            (!useCredit && !paymentProofFile) ||
            (useCredit && creditBalance !== null && creditBalance < totalAmount)
          }
        >
          {isSubmitting || isPreparingProof ? (
            <>
              <Spinner className="mr-2 size-4" />
              {isPreparingProof
                ? t("booking.payment.readingProof")
                : t("booking.payment.creatingBooking")}
            </>
          ) : (
            t("booking.payment.confirmAndCreate")
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
