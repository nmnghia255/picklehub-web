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
    case "TOURNAMENT":
      return t("labels.tournament")
    case "TRAINING":
      return t("labels.training")
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
