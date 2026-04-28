"use server"

import { approveGroupPlaySessionPayment } from "@/features/play-sessions/api/group-play-sessions-service"
import {
  approvePublicPlaySessionPayment,
  submitPublicPlaySessionPayment,
  updatePublicPlaySessionPayment,
} from "@/features/play-sessions/api/public-play-sessions-service"

export type PublicPaymentActionState = {
  success?: boolean
  error?: string
  message?: string
}

export async function updatePublicPlaySessionPaymentAction(
  playSessionId: string,
  _state: PublicPaymentActionState,
  formData: FormData
): Promise<PublicPaymentActionState> {
  try {
    const paymentQrUrl = String(formData.get("paymentQrUrl") ?? "").trim()
    const paymentCode = String(formData.get("paymentCode") ?? "").trim()
    const paymentNote = String(formData.get("paymentNote") ?? "").trim()

    await updatePublicPlaySessionPayment(playSessionId, {
      paymentQrUrl,
      paymentCode,
      paymentNote,
    })

    return {
      success: true,
      message: "Đã cập nhật thông tin thanh toán.",
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Không thể cập nhật thanh toán.",
    }
  }
}

export async function submitPublicPlaySessionPaymentAction(
  playSessionId: string,
  _state: PublicPaymentActionState,
  _formData: FormData
): Promise<PublicPaymentActionState> {
  try {
    await submitPublicPlaySessionPayment(playSessionId)

    return {
      success: true,
      message: "Đã gửi xác nhận thanh toán, chờ host duyệt.",
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Không thể gửi xác nhận thanh toán.",
    }
  }
}

export async function verifyPlaySessionPaymentAction(
  playSessionId: string,
  participantUserId: string,
  groupId: string | null,
  _state: PublicPaymentActionState,
  _formData: FormData
): Promise<PublicPaymentActionState> {
  try {
    if (groupId) {
      await approveGroupPlaySessionPayment(
        groupId,
        playSessionId,
        participantUserId
      )
    } else {
      await approvePublicPlaySessionPayment(playSessionId, participantUserId)
    }

    return {
      success: true,
      message: "Đã xác minh thanh toán.",
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Không thể xác minh thanh toán.",
    }
  }
}
