import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

import { useBookingStore } from "../../stores/booking-store"
import { PaymentMethodSelector } from "../booking-confirmation/payment-method-selector"

export function BookingPaymentMethodCard() {
  const { t } = useSportCenterTranslation()
  const useCredit = useBookingStore((state) => state.useCredit)
  const setUseCredit = useBookingStore((state) => state.setUseCredit)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("booking.payment.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <PaymentMethodSelector
          useCredit={useCredit}
          setUseCredit={setUseCredit}
        />
      </CardContent>
    </Card>
  )
}
