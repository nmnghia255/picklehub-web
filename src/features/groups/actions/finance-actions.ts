"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

import {
  createExpense,
  createFund,
  deleteExpense,
  deleteFund,
  payFund,
  updateExpense,
  updateFund,
  uploadFinanceReceiptFile,
  verifyFundPayment,
} from "../api/finance-service"

export interface FinanceActionState {
  success?: boolean
  error?: string
}

function getMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const rawMessage = error.response?.data?.message

    if (typeof rawMessage === "string") {
      if (rawMessage.includes("Payment record not found")) {
        return "Không tìm thấy bản ghi thanh toán cho thành viên này trong quỹ."
      }

      if (
        rawMessage.includes(
          "Cannot update fund amount as there are existing payments"
        )
      ) {
        return "Không thể cập nhật số tiền quỹ vì đã có thanh toán liên quan."
      }

      return rawMessage
    }

    return fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export async function createFundAction(
  groupId: string,
  _prevState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  try {
    await createFund(groupId, {
      title: formData.get("title")?.toString().trim() ?? "",
      description: formData.get("description")?.toString().trim() || undefined,
      amount: formData.get("amount")?.toString().trim() ?? "",
      deadline: formData.get("deadline")?.toString().trim() || undefined,
    })

    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    return { error: getMessage(error, "Tạo fund thất bại. Vui lòng thử lại.") }
  }
}

export async function updateFundAction(
  groupId: string,
  fundId: string,
  _prevState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  try {
    const title = formData.get("title")?.toString().trim()
    const description = formData.get("description")?.toString().trim()
    const amount = formData.get("amount")?.toString().trim()
    const deadline = formData.get("deadline")?.toString().trim()

    await updateFund(groupId, fundId, {
      ...(title ? { title } : {}),
      ...(description !== undefined
        ? { description: description.length > 0 ? description : null }
        : {}),
      ...(amount ? { amount } : {}),
      ...(deadline ? { deadline } : {}),
    })

    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    return {
      error: getMessage(error, "Cập nhật fund thất bại. Vui lòng thử lại."),
    }
  }
}

export async function deleteFundAction(
  groupId: string,
  fundId: string,
  _prevState: FinanceActionState,
  _formData: FormData
): Promise<FinanceActionState> {
  try {
    await deleteFund(groupId, fundId)
    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    return { error: getMessage(error, "Xóa fund thất bại. Vui lòng thử lại.") }
  }
}

export async function payFundAction(
  groupId: string,
  fundId: string,
  _prevState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  try {
    const paymentReceiptFileField = formData.get("paymentReceiptFile")
    const paymentReceiptFile =
      paymentReceiptFileField instanceof File &&
      paymentReceiptFileField.size > 0
        ? paymentReceiptFileField
        : null

    let paymentReceiptUrl: string | undefined

    if (paymentReceiptFile) {
      const uploadResult = await uploadFinanceReceiptFile(paymentReceiptFile)
      paymentReceiptUrl = uploadResult.url
    }

    await payFund(groupId, fundId, {
      paymentReceiptUrl,
    })

    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    return { error: getMessage(error, "Gửi yêu cầu thanh toán thất bại.") }
  }
}

export async function verifyFundPaymentAction(
  groupId: string,
  fundId: string,
  paymentId: string,
  _prevState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  try {
    const status = formData.get("status")?.toString() as
      | "PAID"
      | "REJECTED"
      | null

    if (!status) {
      return { error: "Thiếu trạng thái xác nhận payment." }
    }

    await verifyFundPayment(groupId, fundId, paymentId, { status })
    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    return { error: getMessage(error, "Xác nhận payment thất bại.") }
  }
}

export async function createExpenseAction(
  groupId: string,
  _prevState: FinanceActionState,
  formData: FormData
): Promise<FinanceActionState> {
  try {
    // Support file upload for expense receipt: field name `receiptFile`.
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
      amount: formData.get("amount")?.toString().trim() ?? "",
      receiptUrl,
      expenseDate: formData.get("expenseDate")?.toString().trim() || undefined,
    })

    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    return {
      error: getMessage(error, "Tạo expense thất bại. Vui lòng thử lại."),
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
    const amount = formData.get("amount")?.toString().trim()
    const expenseDate = formData.get("expenseDate")?.toString().trim()

    // Handle receipt file upload if provided
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
      ...(amount ? { amount } : {}),
      ...(receiptUrl !== undefined
        ? { receiptUrl: receiptUrl.length > 0 ? receiptUrl : null }
        : {}),
      ...(expenseDate ? { expenseDate } : {}),
    })

    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    return {
      error: getMessage(error, "Cập nhật expense thất bại. Vui lòng thử lại."),
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
    revalidatePath(`/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    return {
      error: getMessage(error, "Xóa expense thất bại. Vui lòng thử lại."),
    }
  }
}
