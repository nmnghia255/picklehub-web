import type { EnrollmentListItemDTO, EnrollmentCreateDTO } from '../../types/dto/enrollment-dto'
import type { EnrollmentModel } from '../../types/models/enrollment-model'

function getPaymentInfo(
  dto: EnrollmentListItemDTO | EnrollmentCreateDTO
): { paymentAccountName: string; paymentAccountNumber: string; paymentBankName: string; paymentQrUrl: string } {
  if ('coachClass' in dto) {
    const p = dto.coachClass.coachProfile
    return {
      paymentAccountName: p.paymentAccountName ?? '',
      paymentAccountNumber: p.paymentAccountNumber ?? '',
      paymentBankName: p.paymentBankName ?? '',
      paymentQrUrl: p.paymentQrUrl ?? '',
    }
  }
  return {
    paymentAccountName: dto.coachPaymentInfo?.paymentAccountName ?? '',
    paymentAccountNumber: dto.coachPaymentInfo?.paymentAccountNumber ?? '',
    paymentBankName: dto.coachPaymentInfo?.paymentBankName ?? '',
    paymentQrUrl: dto.coachPaymentInfo?.paymentQrUrl ?? '',
  }
}

export function mapEnrollment(dto: EnrollmentListItemDTO): EnrollmentModel {
  const payment = getPaymentInfo(dto)
  return {
    id: dto.id,
    classId: dto.classId,
    status: dto.status,
    paymentStatus: dto.paymentStatus,
    amountVnd: dto.amountVnd,
    className: dto.coachClass.title,
    classLevel: dto.coachClass.level,
    locationDescription: dto.coachClass.locationDescription,
    coachName: dto.coachClass.coachProfile.displayName,
    coachAvatar: dto.coachClass.coachProfile.avatarUrl,
    paymentAccountName: payment.paymentAccountName,
    paymentAccountNumber: payment.paymentAccountNumber,
    paymentBankName: payment.paymentBankName,
    paymentQrUrl: payment.paymentQrUrl,
    scheduleDate: dto.coachClass.schedules?.[0]?.scheduledAt ?? null,
  }
}

export function mapCreateEnrollment(dto: EnrollmentCreateDTO): EnrollmentModel {
  const payment = getPaymentInfo(dto)
  return {
    id: dto.id,
    classId: dto.classId,
    status: dto.status,
    paymentStatus: dto.paymentStatus,
    amountVnd: dto.amountVnd,
    className: '',
    classLevel: '',
    locationDescription: '',
    coachName: dto.learnerProfile?.name ?? '',
    coachAvatar: dto.learnerProfile?.avatarUrl ?? '',
    paymentAccountName: payment.paymentAccountName,
    paymentAccountNumber: payment.paymentAccountNumber,
    paymentBankName: payment.paymentBankName,
    paymentQrUrl: payment.paymentQrUrl,
    scheduleDate: null,
  }
}
