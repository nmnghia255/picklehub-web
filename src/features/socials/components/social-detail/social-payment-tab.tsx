"use client"

import { format } from "date-fns"
import { CheckCircle2, UploadCloud } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPaymentStatusLabel } from "@/features/socials/utils"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd, getPaymentStatusTone } from "@/utils/expense-utils"

import { submitPaymentAction } from "../../actions/payment-actions"
import { UploadImageAction } from "../../actions/upload-image-action"
import type { PlaySession } from "../../types/play-session"
import type { SocialDetail } from "../../types/social"
import { PaymentInformationCard } from "./payment-information-card"

function UploadPaymentProofCard({
  socialId,
  amount,
}: {
  socialId?: string
  amount: number
}) {
  const { t } = useSocialsTranslation()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setIsSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!file || !socialId) return

    setIsUploading(true)
    try {
      const url = await UploadImageAction(file)
      await submitPaymentAction(socialId, url, amount)
      setIsSuccess(true)
      setFile(null)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit payment proof."
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">{t("payment.uploadProof")}</CardTitle>
        <CardDescription className="mt-1">
          {t("payment.uploadDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center text-emerald-600">
            <CheckCircle2 className="size-12" />
            <div>
              <p className="font-semibold text-foreground">
                {t("payment.uploadSuccessTitle")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("payment.uploadSuccessDescription")}
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setIsSuccess(false)}
            >
              {t("payment.uploadAnother")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border/60 bg-muted/10 p-8 text-center transition-colors hover:bg-muted/30">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {t("payment.clickToUpload")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("payment.clickToUploadDescription")}
              </p>
            </div>
            <div className="relative mt-2">
              <input
                type="file"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button variant="outline" type="button">
                {file ? file.name : t("payment.selectFile")}
              </Button>
            </div>
          </div>
        )}
        {!isSuccess && (
          <div className="flex justify-end pt-2">
            <Button disabled={!file || isUploading} onClick={handleUpload}>
              {isUploading ? t("common.uploading") : t("payment.submitProof")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function JoinedSessionsSection({
  sessions,
  totalFee,
}: {
  sessions?: PlaySession[]
  totalFee: number
}) {
  const { t } = useSocialsTranslation()
  const joinedSessions = sessions || []

  if (joinedSessions.length === 0) return null

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">{t("payment.joinedSessions")}</CardTitle>
        <CardDescription className="mt-1">
          {t("payment.joinedSessionsDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/60">
          {joinedSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 transition-colors hover:bg-muted/10 sm:p-6"
            >
              <div>
                <p className="font-medium">
                  {session.title || t("common.playSession")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span suppressHydrationWarning>
                    {format(new Date(session.startTime), "PPp")} -{" "}
                    {format(new Date(session.endTime), "p")}
                  </span>
                </p>
              </div>
              <div className="text-lg font-semibold text-primary">
                {formatCurrencyVnd(session.sessionFee || 0)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t-2 border-border/60 bg-muted/20 p-4 sm:p-6">
          <p className="text-lg font-semibold">{t("payment.totalFeeToPay")}</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrencyVnd(totalFee)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SocialPaymentTab({
  social,
  joinedSessions,
}: {
  social: SocialDetail | null
  joinedSessions?: PlaySession[]
}) {
  const { t } = useSocialsTranslation()
  const userJoinedSessionIds = social?.myParticipantInfo?.joinedSessionIds || []
  const actualJoinedSessions = (joinedSessions || []).filter((session) =>
    userJoinedSessionIds.includes(session.id)
  )

  const totalFee = social?.myParticipantInfo?.totalFee ?? 0

  return (
    <div className="space-y-6">
      <Card className="flex flex-row items-start justify-between border-b border-border/60 bg-muted/20 px-4 py-6 sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("payment.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("payment.subtitle")}
          </p>
        </div>
        {social?.myParticipantInfo?.paymentStatus && (
          <Badge
            className={getPaymentStatusTone(
              social.myParticipantInfo.paymentStatus
            )}
          >
            {getPaymentStatusLabel(social.myParticipantInfo.paymentStatus, t)}
          </Badge>
        )}
      </Card>

      <div className="flex flex-col gap-6">
        <JoinedSessionsSection
          sessions={actualJoinedSessions}
          totalFee={totalFee}
        />
        <PaymentInformationCard social={social} showEditAction={false} />
        <UploadPaymentProofCard socialId={social?.id} amount={totalFee} />
      </div>
    </div>
  )
}
