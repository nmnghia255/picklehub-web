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
