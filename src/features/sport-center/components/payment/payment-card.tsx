"use client"

import { Landmark } from "lucide-react"
import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useBookingStore } from "@/features/sport-center/stores/booking-store"

import BankTransferProof from "./BankTransferProof"
import CreditPaymentInfo from "./CreditPaymentInfo"
import PaymentBankInfo from "./PaymentBankInfo"
import PaymentMethodSelector from "./PaymentMethodSelector"

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
      loadingToastId.current = toast.loading("Đang gửi thanh toán...")
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

    toast.success("Hoàn tất", {
      description: submitMessage,
    })
  }, [submitMessage])

  useEffect(() => {
    if (!submitError) return

    if (loadingToastId.current) {
      toast.dismiss(loadingToastId.current)
      loadingToastId.current = undefined
    }

    toast.error("Có lỗi xảy ra", {
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
      setPaymentProofError("Vui lòng chọn file ảnh hợp lệ.")
      return
    }

    setPaymentProofFile(file)
    setPaymentProofPreviewUrl(URL.createObjectURL(file))

    void onProofSelected(file)
  }

  const handleConfirm = async () => {
    try {
      if (requiresProof && !paymentProofFile) {
        setPaymentProofError("Vui lòng tải lên ảnh minh chứng thanh toán.")
        return
      }

      await onConfirm()
    } catch (error) {
      setPaymentProofError(
        error instanceof Error
          ? error.message
          : "Không thể xử lý ảnh minh chứng thanh toán."
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
          Phương thức thanh toán
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
                ? "Đang tải ảnh minh chứng..."
                : isPreparingProof
                  ? "Đang đọc ảnh minh chứng..."
                  : "Đang tải..."}
            </>
          ) : (
            "Xác nhận"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
