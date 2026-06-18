import type { PlaySession } from "./types/play-session"
import type { ListSocial as Social } from "./types/social"

export function getStatusClasses(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "border-primary/30 bg-primary/10 text-primary"
    case "COMPLETED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
    case "CANCELLED":
      return "border-destructive/30 bg-destructive/10 text-destructive"
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
  switch (status) {
    case "CONFIRMED":
      return t("participantStatus.confirmed")
    case "CANCELLED":
      return t("participantStatus.cancelled")
    case "REJECTED":
      return t("participantStatus.rejected")
    case "WAITLISTED":
      return t("participantStatus.waitlisted")
    case "ON_HOLD":
      return t("participantStatus.onHold")
    default:
      return t("participantStatus.pending")
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

export const getPaymentStatusLabel = (
  status: string,
  t: (key: string) => string
) => {
  switch (status) {
    case "PAID":
      return t("expenses.tracking.paid")
    case "UNPAID":
      return t("expenses.tracking.unpaid")
    case "PARTIALLY_PAID":
      return t("expenses.tracking.partiallyPaid")
    case "OVERPAID":
      return t("expenses.tracking.overpaid")
    case "REFUNDED":
      return t("expenses.tracking.refunded")
    default:
      return status
  }
}
