"use client"

import React from "react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  getPaymentStatusLabel,
  isActiveSocialParticipantStatus,
} from "@/features/socials/utils"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"
import { getPaymentStatusTone } from "@/utils/expense-utils"

import type { PlaySession } from "../../../types/play-session"
import type { SocialDetail } from "../../../types/social"
import { DisplayPaymentProofCard } from "./display-payment-proof-card"
import { JoinedSessionsSection } from "./joined-sessions-section"
import { PaymentInformationCard } from "./payment-information-card"
import { UploadPaymentProofCard } from "./upload-payment-proof-card"

export default function SocialPaymentTab({
  social,
  joinedSessions,
}: {
  social: SocialDetail | null
  joinedSessions?: PlaySession[]
}) {
  const { t } = useSocialsTranslation()
  const isParticipant = Boolean(
    social?.myParticipantInfo &&
    isActiveSocialParticipantStatus(social.myParticipantInfo.status)
  )
  const userJoinedSessionIds = social?.myParticipantInfo?.joinedSessionIds || []
  const actualJoinedSessions = (joinedSessions || []).filter((session) =>
    userJoinedSessionIds.includes(session.id)
  )

  const totalFee = social?.myParticipantInfo?.totalFee ?? 0

  const getBadgeContent = () => {
    if (!social?.myParticipantInfo) return null

    const { paymentStatus, paymentUrl } = social.myParticipantInfo

    if (paymentStatus === "UNPAID" && paymentUrl) {
      return {
        text: t("payment.statusPaidButNotConfirmed"),
        tone: getPaymentStatusTone("PAID"),
      }
    }

    if (paymentStatus === "PAID") {
      return {
        text: t("payment.statusPaid"),
        tone: getPaymentStatusTone("PAID"),
      }
    }

    if (paymentStatus === "PARTIALLY_PAID") {
      return {
        text: getPaymentStatusLabel("PARTIALLY_PAID", t),
        tone: getPaymentStatusTone("PARTIALLY_PAID"),
      }
    }

    if (paymentStatus === "UNPAID") {
      return {
        text: t("payment.statusUnpaid"),
        tone: getPaymentStatusTone("UNPAID"),
      }
    }

    if (paymentStatus === "OVERPAID") {
      return {
        text: getPaymentStatusLabel("OVERPAID", t),
        tone: getPaymentStatusTone("OVERPAID"),
      }
    }

    if (paymentStatus === "REFUNDED") {
      return {
        text: getPaymentStatusLabel("REFUNDED", t),
        tone: getPaymentStatusTone("REFUNDED"),
      }
    }

    return {
      text: getPaymentStatusLabel(paymentStatus, t),
      tone: getPaymentStatusTone(paymentStatus),
    }
  }
  const isHost = social?.isHost

  const badgeContent = getBadgeContent()

  return (
    <div className="space-y-6">
      <Card className="flex flex-row items-start justify-between border-b border-border/60 bg-muted/20 px-4 py-6 sm:items-center">
        <div className="pl-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("payment.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("payment.subtitle")}
          </p>
        </div>
        {badgeContent && !isHost && (
          <Badge className={badgeContent.tone}>{badgeContent.text}</Badge>
        )}
      </Card>

      <div className="flex flex-col gap-6">
        <JoinedSessionsSection
          sessions={actualJoinedSessions}
          totalFee={totalFee}
        />
        <PaymentInformationCard social={social} showEditAction={isHost} />
        {!isHost &&
          (social?.myParticipantInfo?.paymentStatus === "PAID" &&
          social?.myParticipantInfo?.paymentUrl ? (
            <DisplayPaymentProofCard
              imageUrl={social.myParticipantInfo.paymentUrl}
            />
          ) : (
            isParticipant &&
            totalFee > 0 && (
              <UploadPaymentProofCard socialId={social?.id} amount={totalFee} />
            )
          ))}
      </div>
    </div>
  )
}
