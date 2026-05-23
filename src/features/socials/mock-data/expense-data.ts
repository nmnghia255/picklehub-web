import type {
  CourtExpenseRow,
  FinancialTimelineRow,
  ParticipantPaymentRow,
} from "./expense-types"

export const expenseRows: CourtExpenseRow[] = [
  {
    id: "court-a-1",
    type: "COURT_BOOKING",
    courtName: "Court A",
    date: "20/05/2026",
    time: "18:00 - 20:00",
    duration: "2h",
    cost: 400000,
  },
  {
    id: "court-b-1",
    type: "COURT_BOOKING",
    courtName: "Court B",
    date: "20/05/2026",
    time: "20:00 - 22:00",
    duration: "2h",
    cost: 400000,
  },
  {
    id: "court-a-2",
    type: "COURT_BOOKING",
    courtName: "Court A",
    date: "21/05/2026",
    time: "18:00 - 20:00",
    duration: "2h",
    cost: 400000,
  },
]

export const participantRows: ParticipantPaymentRow[] = [
  {
    id: "alice",
    participant: "Alice Nguyen",
    participantStatus: "Confirmed",
    amountDue: 100000,
    paymentStatus: "paid",
  },
  {
    id: "bob",
    participant: "Bob Tran",
    participantStatus: "Confirmed",
    amountDue: 100000,
    paymentStatus: "unpaid",
  },
  {
    id: "john",
    participant: "John Park",
    participantStatus: "Confirmed",
    amountDue: 100000,
    paymentStatus: "paid",
  },
  {
    id: "linh",
    participant: "Linh Pham",
    participantStatus: "Confirmed",
    amountDue: 100000,
    paymentStatus: "paid",
  },
  {
    id: "mei",
    participant: "Mei Chen",
    participantStatus: "Confirmed",
    amountDue: 100000,
    paymentStatus: "unpaid",
  },
  {
    id: "duy",
    participant: "Duy Le",
    participantStatus: "Confirmed",
    amountDue: 100000,
    paymentStatus: "paid",
  },
  {
    id: "emma",
    participant: "Emma Wilson",
    participantStatus: "Confirmed",
    amountDue: 100000,
    paymentStatus: "refunded",
  },
  {
    id: "noor",
    participant: "Noor Hassan",
    participantStatus: "Confirmed",
    amountDue: 100000,
    paymentStatus: "paid",
  },
  {
    id: "khanh",
    participant: "Khanh Vo",
    participantStatus: "Confirmed",
    amountDue: 100000,
    paymentStatus: "unpaid",
  },
  {
    id: "sarah",
    participant: "Sarah Martinez",
    participantStatus: "Confirmed",
    amountDue: 100000,
    paymentStatus: "paid",
  },
  {
    id: "harry",
    participant: "Harry Gomez",
    participantStatus: "Confirmed",
    amountDue: 100000,
    paymentStatus: "paid",
  },
  {
    id: "tuan",
    participant: "Tuan Bui",
    participantStatus: "Confirmed",
    amountDue: 100000,
    paymentStatus: "unpaid",
  },
]

export const timelineRows: FinancialTimelineRow[] = [
  {
    id: "event-1",
    type: "court-booking",
    title: "Court Booking Created",
    timestamp: "15/05/2026 • 09:30",
    amount: 400000,
  },
  {
    id: "event-2",
    type: "court-booking",
    title: "Court Booking Created",
    timestamp: "16/05/2026 • 16:15",
    amount: 800000,
  },
  {
    id: "event-3",
    type: "participant-payment",
    title: "Participant Payment Received",
    timestamp: "20/05/2026 • 19:35",
    amount: 100000,
  },
]

export const paymentPlan = {
  bankName: "Vietcombank",
  accountNumber: "SOCIAL-20260522",
  paymentNote: "Pickleball Court Fee",
  qrPreviewLabel: "QR Code Preview",
}
