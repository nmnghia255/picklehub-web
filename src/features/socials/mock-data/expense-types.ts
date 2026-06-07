export type CourtExpenseRow = {
  id: string
  courtName: string
  type: "COURT_BOOKING" | "OTHER"
  date: string
  time: string
  duration: string
  cost: number
}

export type PaymentStatus = "paid" | "unpaid" | "refunded"

export type ParticipantPaymentRow = {
  id: string
  participant: string
  participantStatus: "CONFIRMED" | "WAITLISTED" | "ON_HOLD" | "CANCELLED"
  amountDue: number
  paymentStatus: PaymentStatus
}

export type FinancialTimelineRow = {
  id: string
  type: "court-booking" | "participant-payment"
  timestamp: string
  amount: number
}

export default CourtExpenseRow
