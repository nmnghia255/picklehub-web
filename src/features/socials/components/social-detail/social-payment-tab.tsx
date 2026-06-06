"use client"

import { format } from "date-fns"
import { CheckCircle2, UploadCloud } from "lucide-react"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import type { PlaySession } from "../../types/play-session"
import type { ListSocialResponse as Social } from "../../types/social"
import { PaymentInformationCard } from "./payment-information-card"

function UploadPaymentProofCard() {
  const { t } = useSocialsTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setIsSuccess(false)
    }
  }

  const handleUpload = () => {
    if (!file) return

    setIsUploading(true)
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false)
      setIsSuccess(true)
      setFile(null)
    }, 1500)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">
          {t("expenses.paymentInfo.uploadProof", {
            defaultValue: "Upload Payment Proof",
          })}
        </CardTitle>
        <CardDescription className="mt-1">
          {t("expenses.paymentInfo.uploadDescription", {
            defaultValue:
              "Please upload a screenshot or image of your successful payment transaction.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center text-emerald-600">
            <CheckCircle2 className="size-12" />
            <div>
              <p className="font-semibold text-foreground">
                Upload Successful!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your payment proof has been submitted for review.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setIsSuccess(false)}
            >
              Upload Another
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border/60 bg-muted/10 p-8 text-center transition-colors hover:bg-muted/30">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Click to upload or drag and drop
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                SVG, PNG, JPG or GIF (max. 5MB)
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
                {file ? file.name : "Select File"}
              </Button>
            </div>
          </div>
        )}
        {!isSuccess && (
          <div className="flex justify-end pt-2">
            <Button disabled={!file || isUploading} onClick={handleUpload}>
              {isUploading ? "Uploading..." : "Submit Proof"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function JoinedSessionsSection({ sessions }: { sessions?: PlaySession[] }) {
  const { t } = useSocialsTranslation()
  const joinedSessions = sessions || []
  const totalFee = joinedSessions.reduce(
    (acc, session) => acc + (session.sessionFee || 0),
    0
  )

  if (joinedSessions.length === 0) return null

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <CardTitle className="text-xl">
          {t("payment.joinedSessions", {
            defaultValue: "Joined Play Sessions",
          })}
        </CardTitle>
        <CardDescription className="mt-1">
          {t("payment.joinedSessionsDescription", {
            defaultValue:
              "Below are the play sessions you have joined and their respective fees.",
          })}
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
                  {format(new Date(session.startTime), "PPp")} -{" "}
                  {format(new Date(session.endTime), "p")}
                </p>
              </div>
              <div className="text-lg font-semibold text-primary">
                {formatCurrencyVnd(session.sessionFee || 0)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t-2 border-border/60 bg-muted/20 p-4 sm:p-6">
          <p className="text-lg font-semibold">
            {t("payment.totalFeeToPay", { defaultValue: "Total Fee to Pay" })}
          </p>
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
  social: Social | null
  joinedSessions?: PlaySession[]
}) {
  const { t } = useSocialsTranslation()

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/10 bg-linear-to-br from-background via-background to-primary/5 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("payment.title", { defaultValue: "Payment Details" })}
          </CardTitle>
          <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("payment.subtitle", {
              defaultValue:
                "View the payment information and upload your receipt.",
            })}
          </CardDescription>
        </CardHeader>
      </Card>

      <CardContent className="flex flex-col gap-6 p-0">
        <JoinedSessionsSection sessions={joinedSessions} />
        <PaymentInformationCard social={social} showEditAction={false} />
        <UploadPaymentProofCard />
      </CardContent>
    </div>
  )
}
