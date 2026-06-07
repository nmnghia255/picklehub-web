/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Loader2, MoreHorizontal, Plus, Send } from "lucide-react"
import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { formatCurrencyVnd } from "@/utils/expense-utils"

import {
  createExpenseAction,
  createTransactionAction,
  deleteExpenseAction,
  remindDebtAction,
  updateExpenseAction,
  verifyTransactionAction,
} from "../actions/finance-actions"
import { financeQueryKeys } from "../api/finance-client"
import type { Member } from "../types"
import type {
  ExpenseItem,
  Transaction,
  TransactionStatus,
} from "../types/finance"

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

  return formatCurrencyVnd(numericValue)
}

function formatTransactionStatus(status?: TransactionStatus | null) {
  if (status === "VERIFIED") return "Đã xác nhận"
  if (status === "REJECTED") return "Đã từ chối"
  if (status === "PENDING_REVIEW") return "Đang chờ duyệt"
  return status ?? "-"
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "TV"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
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
    refreshSummary() {
      return queryClient.invalidateQueries({
        queryKey: financeQueryKeys.summary(groupId),
      })
    },
    refreshTransactions() {
      return Promise.all([
        this.refreshSummary(),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.transactions(groupId),
        }),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.creditBalances(groupId),
        }),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.myDebt(groupId),
        }),
      ])
    },
    refreshExpenses() {
      return Promise.all([
        this.refreshSummary(),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.expenses(groupId),
        }),
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.myDebt(groupId),
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

function TransactionForm({
  groupId,
  onDone,
}: {
  groupId: string
  onDone: () => void
}) {
  const [state, formAction, isPending] = useActionState(
    createTransactionAction.bind(null, groupId),
    {}
  )

  useToastState(state, "Đã gửi giao dịch thanh toán.", onDone)

  return (
    <form action={formAction}>
      <div className="space-y-4 py-2">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="tx-amount">Số tiền thanh toán</FieldLabel>
            <Input id="tx-amount" name="amount" type="number" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="tx-receipt-file">
              Tệp biên lai (Tùy chọn)
            </FieldLabel>
            <Input
              id="tx-receipt-file"
              name="receiptFile"
              type="file"
              accept="image/*"
            />
          </Field>
        </FieldGroup>
      </div>

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Gửi thanh toán
        </Button>
      </DialogFooter>
    </form>
  )
}

function ExpenseForm({
  groupId,
  mode,
  expense,
  members,
  onDone,
}: {
  groupId: string
  mode: DialogMode
  expense?: ExpenseItem
  members: Member[]
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
    mode === "create" ? "Đã tạo chi tiêu." : "Đã cập nhật chi tiêu.",
    onDone
  )

  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({})
  const [feeMap, setFeeMap] = useState<Record<string, string>>({})
  const [totalAmount, setTotalAmount] = useState<string>(
    expense?.totalAmount?.toString() ?? ""
  )

  useEffect(() => {
    if (mode === "edit" && expense?.allocations) {
      const newSelected: Record<string, boolean> = {}
      const newFees: Record<string, string> = {}
      expense.allocations.forEach((a) => {
        newSelected[a.userId] = true
        newFees[a.userId] = a.requiredFee.toString()
      })
      setSelectedMap(newSelected)
      setFeeMap(newFees)
    }
  }, [expense, mode])

  const allocations = useMemo(
    () =>
      members
        .filter((m) => selectedMap[m.userId])
        .map((m) => ({
          userId: m.userId,
          requiredFee: Number(feeMap[m.userId] || 0),
        })),
    [feeMap, members, selectedMap]
  )

  const totalAllocated = allocations.reduce((sum, a) => sum + a.requiredFee, 0)
  const totalAmountNum = Number(totalAmount)
  const isTotalMatching =
    totalAllocated === totalAmountNum && totalAmountNum > 0

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
              required
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
              <FieldLabel htmlFor="expense-amount">Tổng số tiền</FieldLabel>
              <Input
                id="expense-amount"
                name="totalAmount"
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="expense-date">Ngày chi</FieldLabel>
              <Input
                id="expense-date"
                name="expenseDate"
                type="date"
                defaultValue={formatDateOnly(expense?.expenseDate ?? null)}
                required
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Phân bổ cho thành viên</FieldLabel>
            <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-2">
              {members.map((member) => (
                <div key={member.userId} className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selectedMap[member.userId]}
                      onChange={(e) =>
                        setSelectedMap((prev) => ({
                          ...prev,
                          [member.userId]: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm">{member.name}</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Số tiền"
                    className="ml-auto w-28"
                    value={feeMap[member.userId] ?? ""}
                    onChange={(e) =>
                      setFeeMap((prev) => ({
                        ...prev,
                        [member.userId]: e.target.value,
                      }))
                    }
                    disabled={!selectedMap[member.userId]}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Đã phân bổ: {formatCurrency(totalAllocated)} /{" "}
                {formatCurrency(totalAmountNum)}
              </span>
              <Button
                type="button"
                variant="link"
                size="xs"
                onClick={() => {
                  if (totalAmountNum > 0 && allocations.length > 0) {
                    const equalShare = Math.floor(
                      totalAmountNum / allocations.length
                    )
                    const remainder = totalAmountNum % allocations.length
                    const newFees: Record<string, string> = { ...feeMap }
                    allocations.forEach((a, idx) => {
                      newFees[a.userId] = (
                        equalShare + (idx === 0 ? remainder : 0)
                      ).toString()
                    })
                    setFeeMap(newFees)
                  }
                }}
              >
                Chia đều
              </Button>
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="expense-receipt-file">Tệp biên lai</FieldLabel>
            <Input
              id="expense-receipt-file"
              name="receiptFile"
              type="file"
              accept="image/*"
            />
          </Field>
        </FieldGroup>
      </div>

      <input
        type="hidden"
        name="allocations"
        value={JSON.stringify(allocations)}
      />

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {mode === "create" ? "Tạo khoản chi" : "Lưu thay đổi"}
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

export function CreateTransactionButton({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false)
  const invalidation = useFinanceInvalidation(groupId)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 size-4" />
        Gửi thanh toán
      </Button>
      <FinanceDialogShell
        open={open}
        onOpenChange={setOpen}
        title="Gửi thanh toán"
        description="Gửi thông tin giao dịch bạn đã chuyển khoản cho nhóm."
      >
        <TransactionForm
          groupId={groupId}
          onDone={() => {
            void invalidation.refreshTransactions()
            setOpen(false)
          }}
        />
      </FinanceDialogShell>
    </>
  )
}

export function CreateExpenseButton({
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
        Tạo khoản chi
      </Button>
      <FinanceDialogShell
        open={open}
        onOpenChange={setOpen}
        title="Tạo khoản chi"
        description="Ghi nhận chi tiêu và phân bổ cho các thành viên."
      >
        <ExpenseForm
          groupId={groupId}
          mode="create"
          members={members}
          onDone={() => {
            void invalidation.refreshExpenses()
            setOpen(false)
          }}
        />
      </FinanceDialogShell>
    </>
  )
}

export function RemindDebtButton({
  groupId,
  members,
}: {
  groupId: string
  members: Member[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [sendEmail, setSendEmail] = useState(true)
  const [state, formAction, isPending] = useActionState(
    remindDebtAction.bind(null, groupId),
    {}
  )

  useToastState(state, "Đã gửi nhắc nợ thành công.", () => setOpen(false))

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Send className="mr-2 size-4" />
        Nhắc nợ
      </Button>
      <FinanceDialogShell
        open={open}
        onOpenChange={setOpen}
        title="Nhắc nợ thành viên"
        description="Gửi thông báo nhắc nhở thành viên hoàn thành các khoản nợ."
      >
        <form action={formAction}>
          <div className="space-y-4 py-2">
            <Field>
              <FieldLabel>Chọn thành viên</FieldLabel>
              <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-2">
                {members.map((m) => (
                  <label key={m.userId} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(m.userId)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedUsers([...selectedUsers, m.userId])
                        else
                          setSelectedUsers(
                            selectedUsers.filter((id) => id !== m.userId)
                          )
                      }}
                    />
                    <span className="text-sm">{m.name}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                />
                <span className="text-sm">Gửi kèm Email thông báo</span>
              </label>
            </Field>
          </div>
          <input
            type="hidden"
            name="userIds"
            value={JSON.stringify(selectedUsers)}
          />
          <input type="hidden" name="sendEmail" value={String(sendEmail)} />
          <DialogFooter showCloseButton>
            <Button
              type="submit"
              disabled={isPending || selectedUsers.length === 0}
            >
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Gửi nhắc nợ
            </Button>
          </DialogFooter>
        </form>
      </FinanceDialogShell>
    </>
  )
}

export function TransactionRowActions({
  groupId,
  transaction,
  canManage,
}: {
  groupId: string
  transaction: Transaction
  canManage: boolean
}) {
  const invalidation = useFinanceInvalidation(groupId)
  const [state, formAction, isPending] = useActionState(
    verifyTransactionAction.bind(null, groupId, transaction.id),
    {}
  )

  useToastState(state, "Đã cập nhật trạng thái giao dịch.", () =>
    invalidation.refreshTransactions()
  )

  if (!canManage || transaction.status !== "PENDING_REVIEW") return null

  return (
    <form action={formAction} className="flex gap-2">
      <Button
        type="submit"
        name="status"
        value="VERIFIED"
        size="xs"
        disabled={isPending}
      >
        Duyệt
      </Button>
      <Button
        type="submit"
        name="status"
        value="REJECTED"
        size="xs"
        variant="destructive"
        disabled={isPending}
      >
        Từ chối
      </Button>
    </form>
  )
}

export function ExpenseRowActions({
  groupId,
  expense,
  members,
  canManage,
}: {
  groupId: string
  expense: ExpenseItem
  members: Member[]
  canManage: boolean
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [expenseDetail, setExpenseDetail] = useState<ExpenseItem | null>(null)
  const invalidation = useFinanceInvalidation(groupId)

  const loadDetail = async () => {
    if (expenseDetail) return
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses/${expense.id}`)
      const json = await res.json()
      setExpenseDetail(json.data)
    } catch (err) {
      toast.error("Không thể tải chi tiết khoản chi.")
    } finally {
      setDetailLoading(false)
    }
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
          <DropdownMenuItem
            onSelect={() => {
              setViewOpen(true)
              void loadDetail()
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
        open={viewOpen}
        onOpenChange={setViewOpen}
        title="Chi tiết khoản chi"
        description={expense.title}
      >
        {detailLoading ? (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto animate-spin" />
          </div>
        ) : expenseDetail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase">
                  Số tiền
                </div>
                <div className="font-semibold">
                  {formatCurrency(expenseDetail.totalAmount)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase">
                  Ngày chi
                </div>
                <div className="font-semibold">
                  {formatDate(expenseDetail.expenseDate)}
                </div>
              </div>
            </div>
            {expenseDetail.description && (
              <div>
                <div className="text-xs text-muted-foreground uppercase">
                  Mô tả
                </div>
                <div className="text-sm">{expenseDetail.description}</div>
              </div>
            )}
            {expenseDetail.receiptUrl && (
              <div>
                <div className="text-xs text-muted-foreground uppercase">
                  Chứng từ
                </div>
                <PaymentReceiptPreview receiptUrl={expenseDetail.receiptUrl} />
              </div>
            )}
            <div>
              <div className="mb-2 text-xs text-muted-foreground uppercase">
                Phân bổ
              </div>
              <div className="space-y-2">
                {expenseDetail.allocations?.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={a.user?.avatarUrl || ""} />
                        <AvatarFallback>
                          {getInitials(a.user?.name || "?")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{a.user?.name}</span>
                    </div>
                    <div className="text-right">
                      <div>{formatCurrency(a.requiredFee)}</div>
                      <Badge
                        variant={a.status === "PAID" ? "default" : "outline"}
                        className="h-4 text-[10px]"
                      >
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </FinanceDialogShell>

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
          members={members}
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
    </>
  )
}
