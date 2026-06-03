"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Loader2, MoreHorizontal, Plus } from "lucide-react"
import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
  createExpenseAction,
  createFundAction,
  deleteExpenseAction,
  deleteFundAction,
  payFundAction,
  updateExpenseAction,
  updateFundAction,
  verifyFundPaymentAction,
} from "../actions/finance-actions"
import { financeQueryKeys } from "../api/finance-client"
import type { Member } from "../types"
import type { ExpenseItem, FundItem, FundPayment } from "../types/finance"

function formatDateInput(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 16)
}

function formatDateOnly(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

function formatDate(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatCurrency(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "-"

  const numericValue = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(numericValue)) {
    return String(value ?? "-")
  }

  return new Intl.NumberFormat("vi-VN").format(numericValue)
}

function formatPaymentStatus(status?: string | null) {
  const normalized = status?.toUpperCase()

  if (normalized === "PAID") {
    return "Đã thanh toán"
  }

  if (normalized === "REJECTED") {
    return "Đã từ chối"
  }

  if (normalized === "PENDING") {
    return "Đang chờ"
  }

  return status ?? "-"
}

function isImageReceiptUrl(url?: string | null) {
  if (!url) return false

  const normalized = url.toLowerCase()
  return (
    normalized.includes(".jpg") ||
    normalized.includes(".jpeg") ||
    normalized.includes(".png") ||
    normalized.includes(".webp") ||
    normalized.includes(".gif") ||
    normalized.includes("image/upload")
  )
}

export function PaymentReceiptPreview({ receiptUrl }: { receiptUrl: string }) {
  const [open, setOpen] = useState(false)
  const isImage = isImageReceiptUrl(receiptUrl)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="h-7 rounded-full px-2.5"
        onClick={() => setOpen(true)}
      >
        {isImage ? "Xem ảnh" : "Xem chứng từ"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-4xl">
          <div className="grid max-h-[90vh] gap-0 overflow-hidden md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="flex items-center justify-center bg-black/90 p-4 md:min-h-[70vh]">
              {isImage ? (
                <img
                  src={receiptUrl}
                  alt="Biên lai thanh toán"
                  className="max-h-[78vh] w-full max-w-full rounded-md object-contain"
                />
              ) : (
                <iframe
                  src={receiptUrl}
                  title="Biên lai thanh toán"
                  className="h-[78vh] w-full rounded-md bg-white"
                />
              )}
            </div>

            <div className="flex flex-col gap-4 border-t p-5 md:border-t-0 md:border-l">
              <DialogHeader className="text-left">
                <DialogTitle>Chứng từ thanh toán</DialogTitle>
                <DialogDescription>
                  Xem chứng từ ngay trong trang hiện tại.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  {isImage
                    ? "Ảnh được hiển thị ở kích thước lớn để kiểm tra chi tiết."
                    : "Tệp chứng từ được mở trực tiếp trong khung xem nội tuyến."}
                </p>
              </div>

              <div className="mt-auto flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

type DialogMode = "create" | "edit"

function useToastState(
  state: { success?: boolean; error?: string },
  successMessage: string,
  onSuccess: () => void
) {
  const handledRef = useRef(false)

  useEffect(() => {
    if (state.success && !handledRef.current) {
      handledRef.current = true
      toast.success(successMessage)
      onSuccess()
    }

    if (!state.success) {
      handledRef.current = false
    }

    if (state.error) {
      toast.error(state.error)
    }
  }, [onSuccess, state.error, state.success, successMessage])
}

function useFinanceInvalidation(groupId: string) {
  const queryClient = useQueryClient()

  return {
    refreshFunds() {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: financeQueryKeys.summary(groupId) }),
        queryClient.invalidateQueries({ queryKey: financeQueryKeys.funds(groupId) }),
        queryClient.invalidateQueries({ queryKey: financeQueryKeys.myFunds(groupId) }),
      ])
    },
    refreshExpenses() {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: financeQueryKeys.summary(groupId) }),
        queryClient.invalidateQueries({ queryKey: financeQueryKeys.expenses(groupId) }),
      ])
    },
    refreshFundPayments(fundId: string) {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: financeQueryKeys.summary(groupId) }),
        queryClient.invalidateQueries({ queryKey: financeQueryKeys.funds(groupId) }),
        queryClient.invalidateQueries({ queryKey: financeQueryKeys.myFunds(groupId) }),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.fundPayments(groupId, fundId),
        }),
      ])
    },
  }
}

function FinanceDialogShell({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

function FundForm({
  groupId,
  mode,
  fund,
  members,
  hasExistingPayments,
  onDone,
}: {
  groupId: string
  mode: DialogMode
  fund?: FundItem
  members: Member[]
  hasExistingPayments?: boolean
  onDone: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    mode === "create"
      ? createFundAction.bind(null, groupId)
      : updateFundAction.bind(null, groupId, fund?.id ?? ""),
    {}
  )

  useToastState(
    state,
    mode === "create" ? "Đã tạo quỹ." : "Đã cập nhật quỹ.",
    onDone
  )

  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({})
  const [amountMap, setAmountMap] = useState<Record<string, string>>({})
  const [requiredAmountInput, setRequiredAmountInput] = useState<string>(
    String(fund?.requiredAmount ?? "")
  )
  const [useCredit, setUseCredit] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== "edit" || !fund?.payments) {
      setSelectedMap({})
      setAmountMap({})
      return
    }

    const nextSelectedMap: Record<string, boolean> = {}
    const nextAmountMap: Record<string, string> = {}

    for (const payment of fund.payments) {
      nextSelectedMap[payment.userId] = true
      nextAmountMap[payment.userId] = String(
        payment.requiredAmount ?? payment.amountPaid ?? 0
      )
    }

    setSelectedMap(nextSelectedMap)
    setAmountMap(nextAmountMap)
  }, [fund, mode])

  useEffect(() => {
    setRequiredAmountInput(String(fund?.requiredAmount ?? ""))
  }, [fund?.requiredAmount, mode])

  const targetMembersPayload = useMemo(
    () =>
      members
        .filter((member) => selectedMap[member.userId])
        .map((member) => ({
          userId: member.userId,
          requiredAmount: Number(amountMap[member.userId] || 0),
        })),
    [amountMap, members, selectedMap]
  )

  const requiredAmountNumber = Number(requiredAmountInput)
  const targetMembersTotal = targetMembersPayload.reduce(
    (total, item) => total + Number(item.requiredAmount || 0),
    0
  )
  const isClientPayloadValid =
    targetMembersPayload.length > 0 &&
    !Number.isNaN(requiredAmountNumber) &&
    requiredAmountNumber >= 0 &&
    targetMembersTotal === requiredAmountNumber

  useEffect(() => {
    if (!isClientPayloadValid) {
      if (targetMembersPayload.length === 0) {
        setFormError(null)
        return
      }

      if (Number.isNaN(requiredAmountNumber) || requiredAmountNumber < 0) {
        setFormError("Số tiền quỹ không hợp lệ.")
        return
      }

      setFormError("Tổng số tiền thành viên phải khớp với tổng quỹ.")
      return
    }

    setFormError(null)
  }, [isClientPayloadValid, requiredAmountNumber, targetMembersPayload.length])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    const endpoint = `/api/groups/${groupId}/funds`

    console.log("[finance] createFund form submit", {
      groupId,
      endpoint,
      payload: {
        requiredAmount: requiredAmountNumber,
        targetMembers: targetMembersPayload,
        useCredit,
      },
    })

    if (!isClientPayloadValid) {
      event.preventDefault()
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <div className="space-y-4 py-2">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="fund-title">Tên quỹ</FieldLabel>
            <Input
              id="fund-title"
              name="title"
              defaultValue={fund?.title ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fund-description">Mô tả</FieldLabel>
            <Textarea
              id="fund-description"
              name="description"
              defaultValue={fund?.description ?? ""}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="fund-amount">Số tiền</FieldLabel>
              <Input
                id="fund-amount"
                name="requiredAmount"
                type="number"
                value={requiredAmountInput}
                onChange={(event) => setRequiredAmountInput(event.target.value)}
                disabled={mode === "edit" && !!hasExistingPayments}
              />
              {mode === "edit" && hasExistingPayments ? (
                <p className="text-xs text-muted-foreground">
                  Quỹ đã có thanh toán, không thể thay đổi số tiền.
                </p>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="fund-deadline">Hạn chót</FieldLabel>
              <Input
                id="fund-deadline"
                name="deadline"
                type="datetime-local"
                defaultValue={formatDateInput(fund?.deadline ?? null)}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Thành viên tham gia quỹ</FieldLabel>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
              {members.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Không có thành viên.
                </p>
              ) : (
                members.map((member) => {
                  const checked = !!selectedMap[member.userId]

                  return (
                    <div key={member.userId} className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setSelectedMap((current) => ({
                              ...current,
                              [member.userId]: event.target.checked,
                            }))
                          }
                        />
                        <span className="text-sm">{member.name ?? member.userId}</span>
                      </label>
                      <div className="ml-auto flex items-center gap-2">
                        {(() => {
                           const requiredNum = Number(amountMap[member.userId] ?? 0)
                           const creditBal = Number(
                             (member as Member & { creditBalance?: number })
                               .creditBalance ?? 0
                           )
                           const creditWillUse = useCredit ? Math.min(creditBal, requiredNum) : 0
                          const remainingAfterCredit = Math.max(0, requiredNum - creditWillUse)

                          return (
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground">Số dư: {formatCurrency(creditBal)}</span>
                                {checked ? (
                                  <span className="text-xs text-muted-foreground">Sau khi dùng số dư: {formatCurrency(remainingAfterCredit)}</span>
                                ) : null}
                              </div>
                              <Input
                                type="number"
                                placeholder="Số tiền"
                                value={amountMap[member.userId] ?? ""}
                                onChange={(event) =>
                                  setAmountMap((current) => ({
                                    ...current,
                                    [member.userId]: event.target.value,
                                  }))
                                }
                                disabled={!checked}
                                className="w-28"
                              />
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Chọn từng thành viên và nhập số tiền yêu cầu riêng cho họ.
            </p>
          </Field>

          <Field>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="useCreditUi"
                checked={useCredit}
                onChange={(event) => setUseCredit(event.target.checked)}
                className="mt-1"
              />
              <span className="space-y-1 text-sm">
                <span className="block font-medium text-foreground">
                  Tự động dùng số dư hiện có của thành viên
                </span>
              </span>
            </label>
          </Field>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        </FieldGroup>
      </div>

      <input
        type="hidden"
        name="targetMembers"
        value={JSON.stringify(targetMembersPayload)}
      />
      <input type="hidden" name="useCredit" value={useCredit ? "true" : "false"} />

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending || !isClientPayloadValid}>
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {mode === "create" ? "Tạo quỹ" : "Lưu thay đổi"}
        </Button>
      </DialogFooter>
    </form>
  )
}

function ExpenseForm({
  groupId,
  mode,
  expense,
  onDone,
}: {
  groupId: string
  mode: DialogMode
  expense?: ExpenseItem
  onDone: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    mode === "create"
      ? createExpenseAction.bind(null, groupId)
      : updateExpenseAction.bind(null, groupId, expense?.id ?? ""),
    {}
  )

  useToastState(
    state,
    mode === "create" ? "Đã tạo khoản chi." : "Đã cập nhật khoản chi.",
    onDone
  )

  return (
    <form action={formAction}>
      <div className="space-y-4 py-2">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="expense-title">Tên khoản chi</FieldLabel>
            <Input
              id="expense-title"
              name="title"
              defaultValue={expense?.title ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="expense-description">Mô tả</FieldLabel>
            <Textarea
              id="expense-description"
              name="description"
              defaultValue={expense?.description ?? ""}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="expense-amount">Số tiền</FieldLabel>
              <Input
                id="expense-amount"
                name="amount"
                type="text"
                defaultValue={expense?.amount?.toString() ?? ""}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="expense-date">Ngày chi</FieldLabel>
              <Input
                id="expense-date"
                name="expenseDate"
                type="date"
                defaultValue={formatDateOnly(expense?.expenseDate ?? null)}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="expense-receipt-file">Tệp biên lai</FieldLabel>
            <Input
              id="expense-receipt-file"
              name="receiptFile"
              type="file"
              accept="image/*,.doc,.docx,.xls,.xlsx,.pdf,.csv"
            />
            <p className="text-xs text-muted-foreground">
              Chọn tệp ảnh/PDF/Word/Excel làm chứng từ (tối đa 10MB).
            </p>
          </Field>
        </FieldGroup>
      </div>

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {mode === "create" ? "Tạo khoản chi" : "Lưu thay đổi"}
        </Button>
      </DialogFooter>
    </form>
  )
}

function PayFundForm({
  groupId,
  fund,
  onDone,
}: {
  groupId: string
  fund: FundItem
  onDone: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    payFundAction.bind(null, groupId, fund.id),
    {}
  )
  const [selectedFileName, setSelectedFileName] = useState<string>("")
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<
    string | null
  >(null)
  const invalidation = useFinanceInvalidation(groupId)

  useEffect(() => {
    return () => {
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl)
      }
    }
  }, [selectedImagePreviewUrl])

  useToastState(state, "Đã gửi yêu cầu thanh toán.", () => {
    void invalidation.refreshFundPayments(fund.id)
    onDone()
  })

  const handleReceiptFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const file = event.target.files?.[0]

    if (selectedImagePreviewUrl) {
      URL.revokeObjectURL(selectedImagePreviewUrl)
      setSelectedImagePreviewUrl(null)
    }

    if (!file) {
      setSelectedFileName("")
      return
    }

    setSelectedFileName(file.name)

    if (file.type.startsWith("image/")) {
      setSelectedImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  return (
    <form action={formAction}>
      <div className="space-y-4 py-2">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="payment-receipt-file">Tệp biên lai</FieldLabel>
            <Input
              id="payment-receipt-file"
              name="paymentReceiptFile"
              type="file"
              accept="image/*,.doc,.docx,.xls,.xlsx,.pdf,.csv"
              onChange={handleReceiptFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Hỗ trợ ảnh, Word, Excel, PDF, CSV (tối đa 10MB).
            </p>
            {selectedFileName ? (
              <p className="text-xs text-muted-foreground">
                Đã chọn: {selectedFileName}
              </p>
            ) : null}
            {selectedImagePreviewUrl ? (
              <a
                href={selectedImagePreviewUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-fit"
              >
                <img
                  src={selectedImagePreviewUrl}
                  alt="Xem trước biên lai"
                  className="mt-2 h-28 w-28 rounded-md border object-cover"
                />
              </a>
            ) : null}
          </Field>
        </FieldGroup>
      </div>

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Gửi yêu cầu thanh toán
        </Button>
      </DialogFooter>
    </form>
  )
}

function DeleteForm({
  label,
  action,
  onDone,
}: {
  label: string
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>
  onDone: () => void
}) {
  const [state, formAction, isPending] = useActionState(action, {})

  useToastState(state, "Đã xóa thành công.", onDone)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2 py-2 text-sm text-muted-foreground">
        {label}
      </div>
      <DialogFooter showCloseButton={false} className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          disabled={isPending}
        >
          Hủy
        </Button>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Xác nhận xóa
        </Button>
      </DialogFooter>
    </form>
  )
}

export function PaymentVerifyRow({
  groupId,
  fundId,
  payment,
  compact = false,
  className,
  onDone,
}: {
  groupId: string
  fundId: string
  payment: FundPayment
  compact?: boolean
  className?: string
  onDone?: () => void
}) {
  const normalizedStatus = payment.status?.toUpperCase()
  const canVerify = normalizedStatus === "PENDING"
  const invalidation = useFinanceInvalidation(groupId)
  const [state, formAction, isPending] = useActionState(
    verifyFundPaymentAction.bind(null, groupId, fundId, payment.id),
    {}
  )

  useToastState(state, "Đã cập nhật thanh toán.", () => {
    void invalidation.refreshFundPayments(fundId)
    onDone?.()
  })

  if (!canVerify) {
    return null
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-end gap-2 ${className ?? ""}`}
    >
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Input
            name="amountPaid"
            type="number"
            placeholder="Số thực nộp (để trống = required)"
            className="w-32"
          />
          <div className="text-xs text-muted-foreground">
            {(() => {
              const required = Number(payment.requiredAmount ?? 0)
              const creditUsed = Number(payment.creditUsed ?? 0)
              return <span>Yêu cầu: {formatCurrency(required)} | Số dư đã dùng: {formatCurrency(creditUsed)}</span>
            })()}
          </div>
        </div>
        <Button
          type="submit"
          name="status"
          value="PAID"
          size={compact ? "xs" : "sm"}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Duyệt
        </Button>
        <Button
          type="submit"
          name="status"
          value="REJECTED"
          size={compact ? "xs" : "sm"}
          variant="destructive"
          disabled={isPending}
        >
          Từ chối
        </Button>
      </form>
    </div>
  )
}

export function CreateFundButton({
  groupId,
  members,
}: {
  groupId: string
  members: Member[]
}) {
  const [open, setOpen] = useState(false)
  const invalidation = useFinanceInvalidation(groupId)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 size-4" />
        Tạo quỹ
      </Button>
      <FinanceDialogShell
        open={open}
        onOpenChange={setOpen}
        title="Tạo quỹ"
        description="Tạo khoản thu mới cho toàn nhóm."
      >
        <FundForm
          groupId={groupId}
          mode="create"
          members={members}
          onDone={() => {
            void invalidation.refreshFunds()
            setOpen(false)
          }}
        />
      </FinanceDialogShell>
    </>
  )
}

export function CreateExpenseButton({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false)
  const invalidation = useFinanceInvalidation(groupId)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 size-4" />
        Tạo khoản chi
      </Button>
      <FinanceDialogShell
        open={open}
        onOpenChange={setOpen}
        title="Tạo khoản chi"
        description="Tạo khoản chi mới cho nhóm."
      >
        <ExpenseForm
          groupId={groupId}
          mode="create"
          onDone={() => {
            void invalidation.refreshExpenses()
            setOpen(false)
          }}
        />
      </FinanceDialogShell>
    </>
  )
}

export function FundRowActions({
  groupId,
  fund,
  members,
  canManage,
  canPay,
  payments,
}: {
  groupId: string
  fund: FundItem
  members: Member[]
  canManage: boolean
  canPay: boolean
  payments: FundPayment[]
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [paymentsOpen, setPaymentsOpen] = useState(false)
  const invalidation = useFinanceInvalidation(groupId)
  const hasActions = canPay || canManage

  if (!hasActions) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 cursor-not-allowed opacity-40"
        disabled
        title="Không có quyền thao tác"
      >
        <MoreHorizontal className="size-4" />
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canPay && (
            <DropdownMenuItem onSelect={() => setPayOpen(true)}>
              Thanh toán
            </DropdownMenuItem>
          )}
          {canManage && (
            <DropdownMenuItem onSelect={() => setPaymentsOpen(true)}>
              Xem thanh toán
            </DropdownMenuItem>
          )}
          {canManage && (
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              Chỉnh sửa
            </DropdownMenuItem>
          )}
          {canManage && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteOpen(true)}
              >
                Xóa
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <FinanceDialogShell
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Chỉnh sửa quỹ"
        description={`Cập nhật quỹ "${fund.title}".`}
      >
        <FundForm
          groupId={groupId}
          mode="edit"
          fund={fund}
          members={members}
          hasExistingPayments={payments.length > 0}
          onDone={() => {
            void invalidation.refreshFunds()
            setEditOpen(false)
          }}
        />
      </FinanceDialogShell>

      <FinanceDialogShell
        open={payOpen}
        onOpenChange={setPayOpen}
        title="Thanh toán quỹ"
        description={`Gửi yêu cầu thanh toán cho quỹ "${fund.title}".`}
      >
        <PayFundForm
          groupId={groupId}
          fund={fund}
          onDone={() => {
            void invalidation.refreshFundPayments(fund.id)
            setPayOpen(false)
          }}
        />
      </FinanceDialogShell>

      <FinanceDialogShell
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xóa quỹ"
        description="Thao tác này không thể hoàn tác."
      >
        <DeleteForm
          label={`Bạn có chắc muốn xóa quỹ "${fund.title}" không?`}
          action={deleteFundAction.bind(null, groupId, fund.id)}
          onDone={() => {
            void invalidation.refreshFunds()
            setDeleteOpen(false)
          }}
        />
      </FinanceDialogShell>

      <FinanceDialogShell
        open={paymentsOpen}
        onOpenChange={setPaymentsOpen}
        title={`Thanh toán của quỹ ${fund.title}`}
        description="Duyệt hoặc từ chối các lượt thanh toán đang chờ."
      >
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có lượt thanh toán nào.
          </p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 text-sm">
                    <div className="font-medium">{payment.userId}</div>
                    <div className="text-muted-foreground">
                      {formatCurrency(payment.amountPaid)} -{" "}
                      {formatPaymentStatus(payment.status)}
                    </div>
                    {payment.paymentReceiptUrl ? (
                      <PaymentReceiptPreview
                        receiptUrl={payment.paymentReceiptUrl}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Chưa có chứng từ thanh toán.
                      </p>
                    )}
                  </div>
                  <PaymentVerifyRow
                    groupId={groupId}
                    fundId={fund.id}
                    payment={payment}
                    onDone={() => {
                      void invalidation.refreshFundPayments(fund.id)
                      setPaymentsOpen(false)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </FinanceDialogShell>
    </>
  )
}

export function ExpenseRowActions({
  groupId,
  expense,
  canManage,
}: {
  groupId: string
  expense: ExpenseItem
  canManage: boolean
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [expenseDetail, setExpenseDetail] = useState<ExpenseItem | null>(null)
  const invalidation = useFinanceInvalidation(groupId)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              if (!groupId || !expense?.id) {
                toast.error(
                  "Thiếu thông tin khoản chi. Không thể tải chi tiết."
                )
                return
              }

              setViewOpen(true)
              if (!expenseDetail) {
                setDetailLoading(true)
                fetch(
                  `/api/groups/${encodeURIComponent(groupId)}/expenses/${encodeURIComponent(
                    expense.id
                  )}`,
                  {
                    credentials: "same-origin",
                  }
                )
                  .then(async (res) => {
                    if (!res.ok) {
                      const json = await res.json().catch(() => ({}))
                      throw new Error(
                        json?.message || "Không thể tải chi tiết khoản chi"
                      )
                    }

                    const payload = await res.json()
                    // API uses envelope { message, data }
                    setExpenseDetail(payload?.data ?? payload)
                  })
                  .catch((err) => {
                    console.error(err)
                    toast.error(
                      err?.message || "Không tải được chi tiết khoản chi."
                    )
                    setViewOpen(false)
                  })
                  .finally(() => setDetailLoading(false))
              }
            }}
          >
            Xem chi tiết
          </DropdownMenuItem>

          {canManage && (
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              Chỉnh sửa
            </DropdownMenuItem>
          )}
          {canManage && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteOpen(true)}
              >
                Xóa
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <FinanceDialogShell
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Chỉnh sửa khoản chi"
        description={`Cập nhật khoản chi "${expense.title}".`}
      >
        <ExpenseForm
          groupId={groupId}
          mode="edit"
          expense={expense}
          onDone={() => {
            void invalidation.refreshExpenses()
            setEditOpen(false)
          }}
        />
      </FinanceDialogShell>

      <FinanceDialogShell
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Xóa khoản chi"
        description="Thao tác này không thể hoàn tác."
      >
        <DeleteForm
          label={`Bạn có chắc muốn xóa khoản chi "${expense.title}" không?`}
          action={deleteExpenseAction.bind(null, groupId, expense.id)}
          onDone={() => {
            void invalidation.refreshExpenses()
            setDeleteOpen(false)
          }}
        />
      </FinanceDialogShell>

      <FinanceDialogShell
        open={viewOpen}
        onOpenChange={() => {
          setViewOpen(false)
          // keep detail cached
        }}
        title="Chi tiết khoản chi"
        description={expense.title}
      >
        {detailLoading ? (
          <div className="py-6 text-center">
            <Loader2 className="mx-auto size-6 animate-spin" />
          </div>
        ) : expenseDetail ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Tên</div>
              <div className="font-medium">{expenseDetail.title}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Số tiền</div>
              <div className="font-medium">
                {formatCurrency(expenseDetail.amount)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Ngày chi</div>
              <div className="font-medium">
                {formatDate(expenseDetail.expenseDate)}
              </div>
            </div>
            {expenseDetail.description ? (
              <div>
                <div className="text-sm text-muted-foreground">Mô tả</div>
                <div className="whitespace-pre-wrap">
                  {expenseDetail.description}
                </div>
              </div>
            ) : null}
            {expenseDetail.receiptUrl ? (
              <div>
                <div className="text-sm text-muted-foreground">Chứng từ</div>
                <PaymentReceiptPreview receiptUrl={expenseDetail.receiptUrl} />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="py-4 text-sm text-muted-foreground">
            Không có dữ liệu.
          </div>
        )}
      </FinanceDialogShell>
    </>
  )
}
