"use client"

import type { Tournament } from "../../types/tournament"
import { PaymentTab as BasePaymentTab } from "../payment-tab/payment"

interface PaymentTabProps {
  tournament?: Tournament
}

export function PaymentTab({ tournament }: PaymentTabProps) {
  if (!tournament) return null
  return <BasePaymentTab tournament={tournament} isHost={false} />
}
