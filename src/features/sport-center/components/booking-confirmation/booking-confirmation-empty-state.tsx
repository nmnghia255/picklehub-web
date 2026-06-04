import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

export function BookingConfirmationEmptyState() {
  const { t } = useSportCenterTranslation()
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 md:px-6">
      <Alert variant="destructive" className="border-destructive/20">
        <AlertTitle>{t("booking.confirmation.emptyStateTitle")}</AlertTitle>
        <AlertDescription>
          {t("booking.confirmation.emptyStateDesc")}
        </AlertDescription>
      </Alert>
    </div>
  )
}
