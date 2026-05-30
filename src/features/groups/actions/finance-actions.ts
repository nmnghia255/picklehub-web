"use server"

import axios from "axios"

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
    const normalizedGroupId = groupId.trim()
    const title = formData.get("title")?.toString().trim() ?? ""
    const description = formData.get("description")?.toString().trim() || undefined
    const deadline = formData.get("deadline")?.toString().trim() || undefined
    const requiredAmountRaw = formData.get("requiredAmount")?.toString().trim() ?? ""
    const requiredAmount = Number(requiredAmountRaw)

    const targetMembersRaw = formData.get("targetMembers")?.toString() || ""
    let targetMembers: { userId: string; requiredAmount?: number }[] = []
    try {
      targetMembers = targetMembersRaw ? JSON.parse(targetMembersRaw) : []
    } catch {
      return { error: "Dữ liệu thành viên không hợp lệ." }
    }

    if (!Array.isArray(targetMembers) || targetMembers.length === 0) {
      return { error: "Vui lòng chọn ít nhất một thành viên cho quỹ." }
    }

    for (const member of targetMembers) {
      if (!member.userId) {
        return { error: "Thành viên không hợp lệ." }
      }

      if (
        member.requiredAmount === undefined ||
        Number.isNaN(Number(member.requiredAmount)) ||
        Number(member.requiredAmount) < 0
      ) {
        return { error: "Số tiền của từng thành viên không hợp lệ." }
      }
    }

    const sum = targetMembers.reduce(
      (total, member) => total + Number(member.requiredAmount || 0),
      0
    )
    if (sum !== requiredAmount) {
      return { error: "Tổng số tiền thành viên phải khớp với tổng quỹ." }
    }

    const endpoint = `/api/groups/${normalizedGroupId}/funds`
    const payload = {
      title,
      description,
      requiredAmount,
      deadline,
      targetMembers,
      useCredit: formData.get("useCredit")?.toString() === "true",
    }

    console.log("[finance] createFundAction request", {
      groupId: normalizedGroupId,
      endpoint,
      payload,
    })

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        normalizedGroupId
      )
    ) {
      return { error: `groupId không hợp lệ: ${normalizedGroupId}` }
    }

    await createFund(normalizedGroupId, payload)

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
    const deadline = formData.get("deadline")?.toString().trim()
    const requiredAmountRaw = formData.get("requiredAmount")?.toString().trim()
    const requiredAmount = requiredAmountRaw ? Number(requiredAmountRaw) : undefined

    const targetMembersRaw = formData.get("targetMembers")?.toString() || ""
    let targetMembers: { userId: string; requiredAmount?: number }[] | undefined

    if (targetMembersRaw) {
      try {
        const parsed = JSON.parse(targetMembersRaw)
        if (Array.isArray(parsed)) {
          targetMembers = parsed
        }
      } catch {
        return { error: "Dữ liệu thành viên không hợp lệ." }
      }
    }

    if (targetMembers && targetMembers.length > 0 && requiredAmount !== undefined) {
      const sum = targetMembers.reduce(
        (total, member) => total + Number(member.requiredAmount || 0),
        0
      )
      if (sum !== requiredAmount) {
        return { error: "Tổng số tiền thành viên phải khớp với tổng quỹ." }
      }
    }

    await updateFund(groupId, fundId, {
      ...(title ? { title } : {}),
      ...(description !== undefined
        ? { description: description.length > 0 ? description : null }
        : {}),
      ...(requiredAmount !== undefined ? { requiredAmount } : {}),
      ...(deadline ? { deadline } : {}),
      ...(targetMembers ? { targetMembers } : {}),
    })

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
      paymentReceiptFileField instanceof File && paymentReceiptFileField.size > 0
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

    const amountPaidRaw = formData.get("amountPaid")?.toString().trim()
    const amountPaid = amountPaidRaw ? Number(amountPaidRaw) : undefined

    await verifyFundPayment(groupId, fundId, paymentId, { status, amountPaid })
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
    return { success: true }
  } catch (error) {
    return {
      error: getMessage(error, "Xóa expense thất bại. Vui lòng thử lại."),
    }
  }
}
