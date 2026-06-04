import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

type BookingConfirmationHeaderProps = {
  onBack: () => void
}

export function BookingConfirmationHeader({
  onBack,
}: BookingConfirmationHeaderProps) {
  const { t } = useSportCenterTranslation()
  return (
    <div className="flex flex-col gap-4 rounded-3xl border bg-card/90 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {t("booking.confirmation.headerTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            {t("booking.confirmation.headerDesc")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="size-4" /> {t("detail.header.back")}
        </Button>
      </div>
    </div>
  )
}
