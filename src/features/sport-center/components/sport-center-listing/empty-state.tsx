"use client"

import { SearchX } from "lucide-react"

import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

export type EmptyStateVariant = "sport-center" | "booking"

interface EmptyStateProps {
  variant?: EmptyStateVariant
}

export function EmptyState({ variant = "sport-center" }: EmptyStateProps) {
  const { t } = useSportCenterTranslation()

  const content =
    variant === "sport-center"
      ? {
          title: t("listing.emptyTitle"),
          description: t("listing.emptyDescription"),
        }
      : {
          title: t("booking.history.noBookings"),
          description: t("booking.history.noBookingsDesc"),
        }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold">{content.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {content.description}
      </p>
    </div>
  )
}
