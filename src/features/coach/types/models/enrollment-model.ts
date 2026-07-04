export interface EnrollmentModel {
  id: string
  classId: string
  status: string
  paymentStatus: string
  amountVnd: number
  className: string
  classLevel: string
  locationDescription: string
  coachName: string
  coachAvatar: string
  paymentAccountName: string
  paymentAccountNumber: string
  paymentBankName: string
  paymentQrUrl: string
  scheduleDate: string | null
}
