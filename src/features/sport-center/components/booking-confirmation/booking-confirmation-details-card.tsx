import { CreditCard } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

type BookingConfirmationDetailsCardProps = {
  centerName: string
  address: string
  selectedDateText: string
  totalDisplay: string
  bookingNote: string
}

export function BookingConfirmationDetailsCard({
  centerName,
  address,
  selectedDateText,
  totalDisplay,
  bookingNote,
}: BookingConfirmationDetailsCardProps) {
  const { t } = useSportCenterTranslation()
  return (
    <Card className="overflow-hidden border shadow-lg shadow-black/5">
      <div className="h-1 bg-linear-to-r from-primary via-primary/70 to-emerald-400" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <CreditCard className="size-5" />
          {t("booking.confirmation.detailsTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-2xl bg-muted/50 p-4">
          <div className="text-md grid gap-3 sm:grid-cols-3">
            <div>
              <p className="mt-1 text-xl font-semibold">{centerName}</p>
              <p className="text-md">{address}</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                {t("booking.summary.bookingDate")}
              </p>
              <p className="font-semibold">{selectedDateText}</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                {t("booking.confirmation.totalMoney")}
              </p>
              <p className="font-semibold">{totalDisplay}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {t("booking.confirmation.noteLabel")}
            </p>
            <Textarea
              value={bookingNote || t("booking.confirmation.noNote")}
              readOnly
              className="mt-2 min-h-24 resize-none bg-background"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
