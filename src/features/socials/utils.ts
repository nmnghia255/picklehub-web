import type { PlaySession } from "./types/play-session"
import type { ListSocial as Social } from "./types/social"

const ACTIVE_PARTICIPANT_STATUSES = ["CONFIRMED", "WAITLISTED"] as const

function toSafeCount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

export function isActiveSocialParticipantStatus(status?: string | null) {
  return Boolean(
    status && ACTIVE_PARTICIPANT_STATUSES.includes(status as never)
  )
}

export function isConfirmedLikeSocialParticipantStatus(status?: string | null) {
  return status === "CONFIRMED"
}

export function isInactiveSocialParticipantStatus(status?: string | null) {
  return status === "CANCELLED" || status === "CANCELED"
}

export function isCancelledSocialStatus(status?: string | null) {
  return status === "CANCELED" || status === "CANCELLED"
}

export function isCompletedSocialStatus(status?: string | null) {
  return status === "COMPLETED"
}

export function isInProgressPlaySessionStatus(status?: string | null) {
  return status === "IN_PROGRESS"
}

export function isCompletedPlaySessionStatus(status?: string | null) {
  return status === "COMPLETED"
}

export function isCancelledPlaySessionStatus(status?: string | null) {
  return status === "CANCELLED" || status === "CANCELED"
}

export function isOpenPlaySessionStatus(status?: PlaySession["status"]) {
  return status === "ACTIVE"
}

export function hasAvailablePlaySessionSlots(
  joinedCount: number | null | undefined,
  maxSlot: number | null | undefined
) {
  if (maxSlot == null) return true
  return toSafeCount(joinedCount) < maxSlot
}

export function canJoinPlaySession(
  status: PlaySession["status"],
  joinedCount: number | null | undefined,
  maxSlot: number | null | undefined,
  isParticipant: boolean
) {
  return (
    isOpenPlaySessionStatus(status) &&
    !isParticipant &&
    hasAvailablePlaySessionSlots(joinedCount, maxSlot)
  )
}

export function canLeavePlaySession(
  status: PlaySession["status"],
  isParticipant: boolean
) {
  return isOpenPlaySessionStatus(status) && isParticipant
}

export function isFullPlaySession(
  status: PlaySession["status"],
  joinedCount: number | null | undefined,
  maxSlot: number | null | undefined,
  isParticipant: boolean
) {
  return (
    isOpenPlaySessionStatus(status) &&
    !isParticipant &&
    !hasAvailablePlaySessionSlots(joinedCount, maxSlot)
  )
}

export function getPlaySessionJoinedCount(
  joinedCount: number | null | undefined
) {
  return toSafeCount(joinedCount)
}

export function getPlaySessionCapacityText(
  joinedCount: number | null | undefined,
  maxSlot: number | null | undefined,
  unlimitedLabel: string
) {
  const safeJoinedCount = toSafeCount(joinedCount)
  return maxSlot == null
    ? `${safeJoinedCount} / ${unlimitedLabel}`
    : `${safeJoinedCount} / ${maxSlot}`
}

export function getStatusClasses(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-400"
    case "COMPLETED":
      return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:border-blue-400/30 dark:bg-blue-400/15 dark:text-blue-400"
    case "CANCELLED":
    case "CANCELED":
      return "border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/40 dark:bg-destructive/20 dark:text-destructive"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

export const getStatusLabel = (status: string, t: (key: string) => string) => {
  switch (status) {
    case "PUBLISHED":
      return t("labels.published")
    case "COMPLETED":
      return t("labels.completed")
    case "CANCELLED":
      return t("labels.cancelled")
    case "CANCELED":
      return t("labels.cancelled")
    default:
      return t("labels.draft")
  }
}

export const getFormatLabel = (format: string, t: (key: string) => string) => {
  switch (format) {
    case "SOCIAL":
      return t("labels.social")
    case "SINGLES":
      return t("labels.singles")
    default:
      return t("labels.social")
  }
}

export const getParticipantStatusLabel = (
  status: string,
  t: (key: string) => string
) => {
  switch (status?.toUpperCase()) {
    case "CONFIRMED":
      return t("participantStatus.confirmed") || "Đã xác nhận"
    case "WAITLISTED":
      return t("participantStatus.waitlisted") || "Chờ duyệt"
    case "CANCELLED":
    case "CANCELED":
      return t("participantStatus.cancelled") || "Đã hủy"
    default:
      return status || ""
  }
}

export function getMatchStatusClasses(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "border-primary/30 bg-primary/10 text-primary"
    case "SCHEDULED":
      return "border-primary/30 bg-primary/10 text-primary"
    case "COMPLETED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
    case "CANCELLED":
      return "border-destructive/30 bg-destructive/10 text-destructive"
    case "IN_PROGRESS":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

export function getSessionStatusLabel(
  status: PlaySession["status"],
  t: (key: string) => string
) {
  switch (status) {
    case "LIVE":
    case "IN_PROGRESS":
      return t("labels.inProgress")
    case "PUBLISHED":
      return t("labels.published")
    case "COMPLETED":
      return t("labels.completed")
    case "CANCELLED":
    case "CANCELED":
      return t("labels.cancelled")
    case "DRAFT":
      return t("labels.draft")
    default:
      return t("labels.scheduled")
  }
}

export function getSessionStatusClasses(status: string) {
  switch (status) {
    case "LIVE":
    case "IN_PROGRESS":
      return "border-orange-500/30 bg-orange-50/50 text-orange-500 dark:bg-orange-950/20"
    case "COMPLETED":
      return "border-emerald-600/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20"
    case "CANCELLED":
    case "CANCELED":
      return "border-destructive/30 bg-destructive/10 text-destructive"
    case "PUBLISHED":
      return "border-primary/30 bg-primary/10 text-primary"
    default:
      return "border-slate-950/20 bg-slate-100 text-slate-950 dark:border-slate-50/20 dark:bg-slate-900/50 dark:text-slate-50"
  }
}

export const getGenderPolicyLabel = (
  social: Social,
  t: (key: string) => string
) => {
  switch (social.genderPolicy) {
    case "MALE_ONLY":
      return t("labels.menOnly")
    case "FEMALE_ONLY":
      return t("labels.womenOnly")
    case "ANY":
      return t("labels.any")
    case "MIXED_ONLY":
      return t("labels.mixed_only")
    default:
      return t("labels.mixed")
  }
}

export function getEffectiveAmountDue(participant: {
  amountDue: number
  totalFee: number
  amountPaid?: number
  amountRefunded?: number
  amountOverpaid?: number
}) {
  if (participant.amountDue > 0) {
    return participant.amountDue
  }
  if (
    typeof participant.amountOverpaid === "number" &&
    participant.amountOverpaid > 0
  ) {
    return -participant.amountOverpaid
  }
  const paid = participant.amountPaid ?? 0
  const refunded = participant.amountRefunded ?? 0
  const netPaid = paid - refunded
  return participant.totalFee - netPaid
}

export const getTransactionStatusLabel = (
  status: string,
  t: (key: string) => string
) => {
  switch (status?.toUpperCase()) {
    case "PENDING_REVIEW":
    case "PENDING":
      return t("expenses.tracking.pendingReview") || "Chờ duyệt"
    case "CONFIRMED":
    case "APPROVED":
      return t("expenses.tracking.confirmed") || "Đã xác nhận"
    case "REJECTED":
      return t("expenses.tracking.rejected") || "Từ chối"
    default:
      return status || ""
  }
}

export const getPaymentStatusLabel = (
  status: string,
  t: (key: string) => string
) => {
  switch (status?.toUpperCase()) {
    case "PAID":
    case "OVERPAID":
      return t("expenses.tracking.paid")
    case "UNPAID":
    case "PARTIALLY_PAID":
      return t("expenses.tracking.unpaid")
    case "REFUNDED":
      return t("expenses.tracking.refunded")
    case "PENDING_REVIEW":
    case "PENDING":
      return t("expenses.tracking.pendingReview") || "Chờ duyệt"
    case "CONFIRMED":
      return t("expenses.tracking.confirmed") || "Đã xác nhận"
    case "REJECTED":
      return t("expenses.tracking.rejected") || "Từ chối"
    default:
      return status || ""
  }
}
