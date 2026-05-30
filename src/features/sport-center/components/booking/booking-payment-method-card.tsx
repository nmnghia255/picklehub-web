import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { useBookingStore } from "../../stores/booking-store"
import { PaymentMethodSelector } from "../payment/PaymentMethodSelector"

export function BookingPaymentMethodCard() {
  const useCredit = useBookingStore((state) => state.useCredit)
  const setUseCredit = useBookingStore((state) => state.setUseCredit)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Phương thức thanh toán</CardTitle>
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
