export type ExpenseType = "COURT_BOOKING"

export type PaymentStatus = "paid" | "unpaid" | "refunded"

export type TimelineEventType = "court-booking" | "participant-payment"

export interface CourtExpenseRow {
  id: string
  type: ExpenseType
  courtName: string
  date: string
  time: string
  duration: string
  cost: number
}

export interface ParticipantPaymentRow {
  id: string
  participant: string
  participantStatus: string
  amountDue: number
  paymentStatus: PaymentStatus
}

export interface FinancialTimelineRow {
  id: string
  type: TimelineEventType
  title: string
  timestamp: string
  amount: number
}
