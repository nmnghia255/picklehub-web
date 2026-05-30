"use server"

import { BookingService } from "@/features/sport-center/api/booking-service"

export async function submitPaymentProofAction(
  bookingId: string,
  paymentProofUrl: string
) {
  if (!bookingId) throw new Error("Missing bookingId")
  if (!paymentProofUrl) throw new Error("Missing paymentProofUrl")

  return await BookingService.submitPaymentProof(bookingId, paymentProofUrl)
}
