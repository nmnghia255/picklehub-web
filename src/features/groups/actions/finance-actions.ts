"use server"

import axios from "axios"

import {
  createExpense,
  createTransaction,
  deleteExpense,
  remindDebt,
  updateExpense,
  uploadFinanceReceiptFile,
  verifyTransaction,
} from "../api/finance-service"

export interface FinanceActionState {
  success?: boolean
  error?: string
}

function getMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const rawMessage = error.response?.data?.message

    if (typeof rawMessage === "string") {
      return rawMessage
    }

    if (Array.isArray(rawMessage)) {
      return rawMessage.join(", ")
    }

    return fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export async function createTransactionAction(
  groupId: string,
  _prevState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  try {
    const amount = Number(formData.get("amount")?.toString().trim() ?? "0")
    if (isNaN(amount) || amount <= 0) {
      return { error: "Số tiền không hợp lệ." }
    }

    const receiptFileField = formData.get("receiptFile")
    const receiptFile =
      receiptFileField instanceof File && receiptFileField.size > 0
        ? receiptFileField
        : null

    let receiptUrl: string | undefined =
      formData.get("receiptUrl")?.toString().trim() || undefined

    if (receiptFile) {
      const uploadResult = await uploadFinanceReceiptFile(receiptFile)
      receiptUrl = uploadResult.url
    }

    await createTransaction(groupId, {
      amount,
      receiptUrl,
    })

    return { success: true }
  } catch (error) {
    return { error: getMessage(error, "Gửi giao dịch thất bại.") }
  }
}

export async function verifyTransactionAction(
  groupId: string,
  txId: string,
  _prevState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  try {
    const status = formData.get("status")?.toString() as "VERIFIED" | "REJECTED"
    if (!status) {
      return { error: "Thiếu trạng thái xác nhận." }
    }

    await verifyTransaction(groupId, txId, { status })
    return { success: true }
  } catch (error) {
    return { error: getMessage(error, "Xác nhận giao dịch thất bại.") }
  }
}

export async function remindDebtAction(
  groupId: string,
  _prevState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  try {
    const userIdsRaw = formData.get("userIds")?.toString() || ""
    const userIds = userIdsRaw ? JSON.parse(userIdsRaw) : []
    const sendEmail = formData.get("sendEmail")?.toString() === "true"

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return { error: "Vui lòng chọn ít nhất một thành viên." }
    }

    await remindDebt(groupId, { userIds, sendEmail })
    return { success: true }
  } catch (error) {
    return { error: getMessage(error, "Gửi nhắc nợ thất bại.") }
  }
}

export async function createExpenseAction(
  groupId: string,
  _prevState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  try {
    const totalAmount = Number(
      formData.get("totalAmount")?.toString().trim() ?? "0"
    )
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return { error: "Tổng số tiền không hợp lệ." }
    }

    const expenseDate = formData.get("expenseDate")?.toString().trim()
    if (!expenseDate) {
      return { error: "Vui lòng chọn ngày chi tiêu." }
    }

    const allocationsRaw = formData.get("allocations")?.toString() || ""
    const allocations = allocationsRaw ? JSON.parse(allocationsRaw) : []

    if (!Array.isArray(allocations) || allocations.length === 0) {
      return { error: "Vui lòng chọn ít nhất một thành viên để phân bổ." }
    }

    const activityId =
      formData.get("activityId")?.toString().trim() || undefined

    const receiptFileField = formData.get("receiptFile")
    const receiptFile =
      receiptFileField instanceof File && receiptFileField.size > 0
        ? receiptFileField
        : null

    let receiptUrl: string | undefined =
      formData.get("receiptUrl")?.toString().trim() || undefined

    if (receiptFile) {
      const uploadResult = await uploadFinanceReceiptFile(receiptFile)
      receiptUrl = uploadResult.url
    }

    await createExpense(groupId, {
      title: formData.get("title")?.toString().trim() ?? "",
      description: formData.get("description")?.toString().trim() || undefined,
      totalAmount,
      receiptUrl,
      expenseDate,
      allocations,
      activityId,
    })

    return { success: true }
  } catch (error) {
    return {
      error: getMessage(error, "Tạo chi tiêu thất bại. Vui lòng thử lại."),
    }
  }
}

export async function updateExpenseAction(
  groupId: string,
  expenseId: string,
  _prevState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  try {
    const title = formData.get("title")?.toString().trim()
    const description = formData.get("description")?.toString().trim()
    const totalAmountRaw = formData.get("totalAmount")?.toString().trim()
    const totalAmount = totalAmountRaw ? Number(totalAmountRaw) : undefined
    const expenseDate = formData.get("expenseDate")?.toString().trim()

    const allocationsRaw = formData.get("allocations")?.toString() || ""
    const allocations = allocationsRaw ? JSON.parse(allocationsRaw) : undefined

    const receiptFileField = formData.get("receiptFile")
    const receiptFile =
      receiptFileField instanceof File && receiptFileField.size > 0
        ? receiptFileField
        : null

    let receiptUrl: string | undefined =
      formData.get("receiptUrl")?.toString().trim() || undefined
    if (receiptFile) {
      const uploadResult = await uploadFinanceReceiptFile(receiptFile)
      receiptUrl = uploadResult.url
    }

    await updateExpense(groupId, expenseId, {
      ...(title ? { title } : {}),
      ...(description !== undefined
        ? { description: description.length > 0 ? description : null }
        : {}),
      ...(totalAmount !== undefined ? { totalAmount } : {}),
      ...(receiptUrl !== undefined
        ? { receiptUrl: receiptUrl.length > 0 ? receiptUrl : null }
        : {}),
      ...(expenseDate ? { expenseDate } : {}),
      ...(allocations ? { allocations } : {}),
    })

    return { success: true }
  } catch (error) {
    return {
      error: getMessage(error, "Cập nhật chi tiêu thất bại. Vui lòng thử lại."),
    }
  }
}

export async function deleteExpenseAction(
  groupId: string,
  expenseId: string,
  _prevState: FinanceActionState,
  _formData: FormData
): Promise<FinanceActionState> {
  try {
    await deleteExpense(groupId, expenseId)
    return { success: true }
  } catch (error) {
    return {
      error: getMessage(error, "Xóa chi tiêu thất bại. Vui lòng thử lại."),
    }
  }
}
