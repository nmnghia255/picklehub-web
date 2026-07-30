/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { vi } from "date-fns/locale/vi"
import {
  Calendar as CalendarIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  Send,
} from "lucide-react"
import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  getActivityClient,
  getActivityMembersClient,
  listActivitiesClient,
} from "@/features/group-activity-schedule/activity-integration"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"
import { cn } from "@/lib/utils"
import { formatCurrencyVnd } from "@/utils/expense-utils"

import {
  createExpenseAction,
  createTransactionAction,
  deleteExpenseAction,
  remindDebtAction,
  updateExpenseAction,
  verifyTransactionAction,
} from "../../actions/finance-actions"
import { financeQueryKeys } from "../../api/finance-client"
import { getGroupMembersClient } from "../../api/groups-client"
import { useGroupDebts } from "../../hooks/use-group-debts"
import type { Member } from "../../types"
import type { ExpenseItem, Transaction } from "../../types/finance"

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

function formatVndString(val: string) {
  const digits = val.replace(/\D/g, "")
  if (!digits) return ""
  return new Intl.NumberFormat("vi-VN").format(Number(digits))
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
  const { t } = useGroupsTranslation()
  const [open, setOpen] = useState(false)
  const isImage = isImageReceiptUrl(receiptUrl)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="h-7 rounded-full bg-emerald-100 px-2.5 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300 dark:shadow-sm"
        onClick={() => setOpen(true)}
      >
        {t("finance.viewReceipt", "Xem chứng từ")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="group-feature-root max-h-[90vh] overflow-hidden p-0 sm:max-w-4xl"
          showCloseButton={false}
        >
          <div className="grid max-h-[90vh] gap-0 overflow-hidden md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="flex items-center justify-center bg-black/90 p-4 md:min-h-[70vh]">
              {isImage ? (
                <img
                  src={receiptUrl}
                  alt={t("finance.receiptAlt", "Biên lai thanh toán")}
                  className="max-h-[78vh] w-full max-w-full rounded-md object-contain"
                />
              ) : (
                <iframe
                  src={receiptUrl}
                  title={t("finance.receiptTitle", "Biên lai thanh toán")}
                  className="h-[78vh] w-full rounded-md bg-white"
                />
              )}
            </div>

            <div className="flex flex-col gap-4 border-t p-5 md:border-t-0 md:border-l">
              <DialogHeader className="text-left">
                <DialogTitle>
                  {t("finance.receiptDialogTitle", "Chứng từ thanh toán")}
                </DialogTitle>
                <DialogDescription>
                  {t(
                    "finance.receiptDialogDesc",
                    "Xem chứng từ ngay trong trang hiện tại."
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-auto flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  {t("activitySchedule.btnClose", "Đóng")}
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
  const { t } = useGroupsTranslation()
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
      toast.error(t(state.error, state.error))
    }
  }, [onSuccess, state.error, state.success, successMessage, t])
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
  headerClassName,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  headerClassName?: string
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="group-feature-root max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogHeader className={headerClassName}>
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
  const { t } = useGroupsTranslation()
  const [state, formAction, isPending] = useActionState(
    createTransactionAction.bind(null, groupId),
    {}
  )
  const [txAmount, setTxAmount] = useState("")

  useToastState(
    state,
    t("finance.transactionSent", "Đã gửi giao dịch thanh toán."),
    onDone
  )

  return (
    <form action={formAction}>
      <div className="space-y-4 py-2">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="tx-amount">
              {t("finance.paymentAmount", "Số tiền thanh toán")}
            </FieldLabel>
            <Input
              id="tx-amount"
              type="text"
              value={txAmount}
              onChange={(e) => setTxAmount(formatVndString(e.target.value))}
              required
            />
            <input
              type="hidden"
              name="amount"
              value={txAmount.replace(/\D/g, "")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="tx-receipt-file">
              {t("finance.receiptFileOptional", "Tệp biên lai (Tùy chọn)")}
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
        <Button type="submit" disabled={isPending} variant="orangeCard">
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {t("finance.sendPayment", "Gửi thanh toán")}
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
  const { t } = useGroupsTranslation()
  const [state, formAction, isPending] = useActionState(
    mode === "create"
      ? createExpenseAction.bind(null, groupId)
      : updateExpenseAction.bind(null, groupId, expense?.id ?? ""),
    {}
  )

  useToastState(
    state,
    mode === "create"
      ? t("finance.expenseCreated", "Đã tạo chi tiêu.")
      : t("finance.expenseUpdated", "Đã cập nhật chi tiêu."),
    onDone
  )

  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>(
    () => {
      if (mode === "create" && !expense?.activityId) {
        const init: Record<string, boolean> = {}
        members.forEach((m) => {
          init[m.userId] = true
        })
        return init
      }
      return {}
    }
  )
  const [feeMap, setFeeMap] = useState<Record<string, string>>({})
  const [guestCountMap, setGuestCountMap] = useState<Record<string, string>>(
    () => {
      if (mode === "create" && !expense?.activityId) {
        const init: Record<string, string> = {}
        members.forEach((m) => {
          init[m.userId] = "0"
        })
        return init
      }
      return {}
    }
  )
  const [guestUnitPriceMap, setGuestUnitPriceMap] = useState<
    Record<string, string>
  >({})
  const [totalAmount, setTotalAmount] = useState<string>(
    expense?.totalAmount ? formatVndString(expense.totalAmount.toString()) : ""
  )
  const [selectedActivityId, setSelectedActivityId] = useState(
    expense?.activityId || ""
  )

  const [title, setTitle] = useState(expense?.title ?? "")
  const [description, setDescription] = useState(expense?.description ?? "")
  const [expenseDate, setExpenseDate] = useState(
    formatDateOnly(expense?.expenseDate ?? null)
  )

  // Fetch activities list for linking (only show those without expenses)
  const activitiesQuery = useQuery({
    queryKey: ["group-activities-for-expense", groupId],
    queryFn: () =>
      listActivitiesClient(groupId, { limit: 100, hasExpense: false }),
    enabled: mode === "create",
  })

  // Fetch selected activity detail for pre-filling attendance/absence
  const activityDetailQuery = useQuery({
    queryKey: [
      "group-activity-detail-for-expense",
      groupId,
      selectedActivityId,
    ],
    queryFn: () => getActivityClient(groupId, selectedActivityId),
    enabled: !!selectedActivityId && selectedActivityId !== "none",
  })

  // Fetch members of the group, optionally with activity details (to get guest count for the activity)
  const membersQuery = useQuery({
    queryKey: ["group-members-for-expense", groupId, selectedActivityId],
    queryFn: () =>
      getGroupMembersClient(
        groupId,
        selectedActivityId ? { activityId: selectedActivityId } : undefined
      ),
    enabled: mode === "create",
    initialData: members,
  })

  // Fetch activity members list to get accurate attendance statuses
  const activityMembersQuery = useQuery({
    queryKey: [
      "group-activity-members-for-expense",
      groupId,
      selectedActivityId,
    ],
    queryFn: () => getActivityMembersClient(groupId, selectedActivityId),
    enabled: !!selectedActivityId && selectedActivityId !== "none",
  })

  const resolvedMembers = useMemo(() => {
    const list = membersQuery.data ?? members

    if (selectedActivityId && activityMembersQuery.data) {
      const actMembers = activityMembersQuery.data.data ?? []
      return [...list].sort((a, b) => {
        const actMemA = actMembers.find((x) => x.userId === a.userId)
        const actMemB = actMembers.find((x) => x.userId === b.userId)
        const isAbsentA = actMemA ? actMemA.attendanceStatus === "ABSENT" : true
        const isAbsentB = actMemB ? actMemB.attendanceStatus === "ABSENT" : true
        if (isAbsentA === isAbsentB) return 0
        return isAbsentA ? 1 : -1
      })
    }
    return list
  }, [
    membersQuery.data,
    members,
    selectedActivityId,
    activityMembersQuery.data,
  ])

  // Sync edits from existing expense
  useEffect(() => {
    if (mode === "edit" && expense) {
      setTitle(expense.title ?? "")
      setDescription(expense.description ?? "")
      setExpenseDate(formatDateOnly(expense.expenseDate ?? null))

      if (expense.allocations) {
        const newSelected: Record<string, boolean> = {}
        const newFees: Record<string, string> = {}
        const newGuestCounts: Record<string, string> = {}
        const newGuestUnitPrices: Record<string, string> = {}
        expense.allocations.forEach((a) => {
          newSelected[a.userId] = true
          const personal = a.requiredFee - (a.guestFee ?? 0)
          newFees[a.userId] = formatVndString(personal.toString())
          newGuestCounts[a.userId] = (a.guestCount ?? 0).toString()
          const gUnitPrice =
            a.guestCount && a.guestCount > 0 && a.guestFee
              ? Math.floor(a.guestFee / a.guestCount)
              : 0
          newGuestUnitPrices[a.userId] = formatVndString(gUnitPrice.toString())
        })
        setSelectedMap(newSelected)
        setFeeMap(newFees)
        setGuestCountMap(newGuestCounts)
        setGuestUnitPriceMap(newGuestUnitPrices)
      }
    }
  }, [expense, mode])

  // Auto fill title, description and date when linked activity details are loaded
  useEffect(() => {
    if (activityDetailQuery.data && mode === "create") {
      const activity = activityDetailQuery.data

      // Auto fill inputs
      setTitle(
        t("finance.expenseActivityTitle", "Hoạt động: {{title}}", {
          title: activity.title,
        })
      )
      setDescription(
        t("finance.expenseActivityDesc", "Chi phí cho hoạt động: {{title}}", {
          title: activity.title,
        })
      )
      if (activity.startAt) {
        const d = new Date(activity.startAt)
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear()
          const mm = String(d.getMonth() + 1).padStart(2, "0")
          const dd = String(d.getDate()).padStart(2, "0")
          setExpenseDate(`${yyyy}-${mm}-${dd}`)
        }
      }
    }
  }, [activityDetailQuery.data, mode, t])

  // Auto fill checklist and guest counts when activity members / attendance is loaded
  useEffect(() => {
    if (activityMembersQuery.data && membersQuery.data && mode === "create") {
      const actMembers = activityMembersQuery.data.data ?? []
      const currentMembers = (membersQuery.data ?? []) as Member[]

      const newSelected: Record<string, boolean> = {}
      const newGuestCounts: Record<string, string> = {}

      currentMembers.forEach((m: Member) => {
        const mGuestCount =
          m.guestCount !== undefined && m.guestCount !== null
            ? String(m.guestCount)
            : null
        const actMem = actMembers.find((a) => a.userId === m.userId)
        if (actMem) {
          newSelected[m.userId] = actMem.attendanceStatus !== "ABSENT"
          newGuestCounts[m.userId] =
            mGuestCount ??
            (actMem.guestStatus === "APPROVED"
              ? String(actMem.guestCount || 0)
              : "0")
        } else {
          newSelected[m.userId] = false
          newGuestCounts[m.userId] = "0"
        }
      })

      setSelectedMap(newSelected)
      setGuestCountMap(newGuestCounts)
    }
  }, [activityMembersQuery.data, membersQuery.data, mode])

  const allocations = useMemo(
    () =>
      resolvedMembers
        .filter((m) => selectedMap[m.userId])
        .map((m) => {
          const personal = Number((feeMap[m.userId] || "0").replace(/\D/g, ""))
          const gCount = Number(guestCountMap[m.userId] || 0)
          const gUnitPrice = Number(
            (guestUnitPriceMap[m.userId] || "0").replace(/\D/g, "")
          )
          const totalGuestFee = gCount * gUnitPrice

          return {
            userId: m.userId,
            requiredFee: personal + totalGuestFee,
            guestCount: gCount,
            guestFee: totalGuestFee,
          }
        }),
    [feeMap, guestCountMap, guestUnitPriceMap, resolvedMembers, selectedMap]
  )

  const totalAllocated = useMemo(
    () => allocations.reduce((sum, a) => sum + a.requiredFee, 0),
    [allocations]
  )
  const totalAmountNum = Number(totalAmount.replace(/\D/g, ""))

  return (
    <form action={formAction}>
      <div className="space-y-4 py-2">
        <FieldGroup>
          {mode === "create" && (
            <Field>
              <FieldLabel htmlFor="expense-activity">
                {t(
                  "finance.linkActivityOptional",
                  "Liên kết hoạt động (không bắt buộc)"
                )}
              </FieldLabel>
              {activitiesQuery.isLoading ? (
                <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  {t(
                    "finance.loadingActivities",
                    "Đang tải danh sách hoạt động..."
                  )}
                </div>
              ) : (
                <Select
                  value={selectedActivityId || "none"}
                  onValueChange={(val) => {
                    const nextVal = val === "none" ? "" : val
                    setSelectedActivityId(nextVal)
                    if (val === "none") {
                      const newSelected: Record<string, boolean> = {}
                      const newGuestCounts: Record<string, string> = {}
                      resolvedMembers.forEach((m) => {
                        newSelected[m.userId] = true
                        newGuestCounts[m.userId] = "0"
                      })
                      setSelectedMap(newSelected)
                      setGuestCountMap(newGuestCounts)
                      setTitle("")
                      setDescription("")
                    }
                  }}
                >
                  <SelectTrigger className="h-9 w-full border bg-background text-xs">
                    <SelectValue
                      placeholder={t(
                        "finance.selectGroupActivity",
                        "Chọn hoạt động nhóm..."
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">
                      {t(
                        "finance.noLinkedActivity",
                        "-- Không liên kết hoạt động --"
                      )}
                    </SelectItem>
                    {activitiesQuery.data?.data?.map((act) => (
                      <SelectItem
                        key={act.id}
                        value={act.id}
                        className="text-xs"
                      >
                        {act.title} -{" "}
                        {new Date(act.startAt).toLocaleDateString("vi-VN")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <input
                type="hidden"
                name="activityId"
                value={selectedActivityId}
              />
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="expense-title">
              {t("finance.expenseName", "Tên khoản chi")}
            </FieldLabel>
            <Input
              id="expense-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="expense-description">
              {t("finance.description", "Mô tả")}
            </FieldLabel>
            <Textarea
              id="expense-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="expense-amount">
                {t("finance.totalAmountLabel", "Tổng số tiền")}
              </FieldLabel>
              <Input
                id="expense-amount"
                type="text"
                value={totalAmount}
                onChange={(e) =>
                  setTotalAmount(formatVndString(e.target.value))
                }
                required
              />
              <input
                type="hidden"
                name="totalAmount"
                value={totalAmount.replace(/\D/g, "")}
              />
              {totalAmountNum > 0 && totalAmountNum < 1000 && (
                <p className="mt-1 text-xs text-rose-500">
                  {t(
                    "errors.invalidTotalAmountMin",
                    "Tổng số tiền phải từ 1.000 VNĐ trở lên."
                  )}
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel>{t("finance.expenseDate", "Ngày chi")}</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-9 w-full justify-start text-left text-xs font-normal",
                      !expenseDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {expenseDate ? (
                      format(new Date(expenseDate), "dd/MM/yyyy")
                    ) : (
                      <span>
                        {t("finance.selectExpenseDate", "Chọn ngày chi...")}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expenseDate ? new Date(expenseDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const yyyy = date.getFullYear()
                        const mm = String(date.getMonth() + 1).padStart(2, "0")
                        const dd = String(date.getDate()).padStart(2, "0")
                        setExpenseDate(`${yyyy}-${mm}-${dd}`)
                      } else {
                        setExpenseDate("")
                      }
                    }}
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
              <input type="hidden" name="expenseDate" value={expenseDate} />
            </Field>
          </div>

          <Field>
            <FieldLabel>
              {t("finance.allocationToMembers", "Phân bổ cho thành viên")}
            </FieldLabel>
            <div className="max-h-80 space-y-3 overflow-y-auto rounded-md border bg-muted/5 p-3">
              {resolvedMembers.map((member) => {
                const isSelected = !!selectedMap[member.userId]
                const personal = Number(feeMap[member.userId] || 0)
                const gCount = Number(guestCountMap[member.userId] || 0)
                const gUnitPrice = Number(guestUnitPriceMap[member.userId] || 0)
                const memberTotal = personal + gCount * gUnitPrice

                return (
                  <div
                    key={member.userId}
                    className="flex flex-col gap-2 rounded-md border bg-card p-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex cursor-pointer items-center gap-2 font-medium">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            setSelectedMap((prev) => ({
                              ...prev,
                              [member.userId]: e.target.checked,
                            }))
                          }
                        />
                        <Avatar className="size-6">
                          <AvatarImage
                            src={member.avatarUrl ?? undefined}
                            alt={member.name}
                          />
                          <AvatarFallback className="bg-slate-200 text-[10px] font-semibold dark:bg-slate-700">
                            {member.name
                              .split(" ")
                              .pop()
                              ?.slice(0, 2)
                              .toUpperCase() ||
                              member.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                      </label>
                      {selectedActivityId &&
                        activityMembersQuery.data &&
                        (() => {
                          const actMem = activityMembersQuery.data.data?.find(
                            (a) => a.userId === member.userId
                          )
                          if (!actMem) return null
                          if (actMem.attendanceStatus === "ABSENT") {
                            return (
                              <Badge
                                variant="outline"
                                className="border-rose-200 bg-rose-50 px-1.5 py-px text-[10px] text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400"
                              >
                                {t("activitySchedule.isAbsentLabel", "Vắng")
                                  .replace("❌", "")
                                  .trim()}
                              </Badge>
                            )
                          }
                          if (actMem.attendanceStatus === "ATTENDING") {
                            return (
                              <Badge
                                variant="outline"
                                className="border-emerald-200 bg-emerald-50 px-1.5 py-px text-[10px] text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
                              >
                                {t(
                                  "activitySchedule.isAttendingLabel",
                                  "Tham gia"
                                )
                                  .replace("✅", "")
                                  .trim()}
                              </Badge>
                            )
                          }
                          return null
                        })()}
                    </div>
                    {isSelected && (
                      <div className="mt-2 space-y-3 border-t border-dashed pt-2">
                        {/* Phí thành viên & Số lượng khách */}
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <span className="mb-0.5 block text-[10px] font-medium text-muted-foreground">
                              {t("finance.memberFee", "Phí thành viên")}
                            </span>
                            <Input
                              type="text"
                              placeholder="0"
                              className="h-8 bg-background text-xs"
                              value={feeMap[member.userId] ?? ""}
                              onChange={(e) =>
                                setFeeMap((prev) => ({
                                  ...prev,
                                  [member.userId]: formatVndString(
                                    e.target.value
                                  ),
                                }))
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <span className="mb-0.5 block text-[10px] font-medium text-muted-foreground">
                              {t(
                                "finance.guestCountLabel",
                                "Số lượng khách đi kèm"
                              )}
                            </span>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              className="h-8 bg-background text-xs"
                              value={guestCountMap[member.userId] ?? ""}
                              onChange={(e) =>
                                setGuestCountMap((prev) => ({
                                  ...prev,
                                  [member.userId]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        {/* Phí mỗi khách (chỉ hiện khi số khách > 0) */}
                        {gCount > 0 && (
                          <div className="flex items-center gap-3 rounded-md border border-dashed bg-muted/20 p-2.5">
                            <div className="flex-1">
                              <span className="mb-0.5 block text-[10px] font-medium text-muted-foreground">
                                {t("finance.feePerGuest", "Phí mỗi khách")}
                              </span>
                              <Input
                                type="text"
                                placeholder="0"
                                className="h-8 bg-background text-xs"
                                value={guestUnitPriceMap[member.userId] ?? ""}
                                onChange={(e) =>
                                  setGuestUnitPriceMap((prev) => ({
                                    ...prev,
                                    [member.userId]: formatVndString(
                                      e.target.value
                                    ),
                                  }))
                                }
                              />
                            </div>
                            <div className="pt-4 text-xs font-medium text-muted-foreground">
                              {t(
                                "finance.multiplyGuest",
                                "× {{count}} khách =",
                                { count: gCount }
                              )}
                            </div>
                            <div className="pt-4 text-xs font-semibold text-foreground">
                              {formatCurrency(gCount * gUnitPrice)}
                            </div>
                          </div>
                        )}

                        {/* Dòng 3: Tổng cộng */}
                        <div className="flex items-center justify-between border-t border-muted-foreground/10 pt-2 text-xs">
                          <span className="font-semibold text-muted-foreground">
                            {t("finance.totalAmountLabel", "Tổng cộng:")}
                          </span>
                          <span className="font-bold text-foreground">
                            {formatCurrency(memberTotal)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                {t(
                  "finance.allocatedLabel",
                  "Đã phân bổ: {{allocated}} / {{total}}",
                  {
                    allocated: formatCurrency(totalAllocated),
                    total: formatCurrency(totalAmountNum),
                  }
                )}
              </span>
              <div className="flex items-center gap-2">
                {selectedActivityId && activityMembersQuery.data && (
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    className="font-medium text-primary"
                    onClick={() => {
                      const actMembers = activityMembersQuery.data?.data
                      if (!actMembers) return
                      const newSelected: Record<string, boolean> = {
                        ...selectedMap,
                      }
                      const newGuestCounts: Record<string, string> = {
                        ...guestCountMap,
                      }

                      resolvedMembers.forEach((m) => {
                        const actMem = actMembers.find(
                          (a) => a.userId === m.userId
                        )
                        if (actMem) {
                          newSelected[m.userId] =
                            actMem.attendanceStatus !== "ABSENT"
                          newGuestCounts[m.userId] =
                            actMem.guestStatus === "APPROVED"
                              ? String(actMem.guestCount || 0)
                              : "0"
                        } else {
                          newSelected[m.userId] = false
                          newGuestCounts[m.userId] = "0"
                        }
                      })

                      setSelectedMap(newSelected)
                      setGuestCountMap(newGuestCounts)
                    }}
                  >
                    {t(
                      "finance.selectParticipantsOnly",
                      "Chọn thành viên tham gia"
                    )}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  onClick={() => {
                    if (totalAmountNum > 0) {
                      const selectedMembers = resolvedMembers.filter(
                        (m) => selectedMap[m.userId]
                      )
                      if (selectedMembers.length === 0) return

                      let totalSlots = 0
                      selectedMembers.forEach((m) => {
                        const gCount = Number(guestCountMap[m.userId] || 0)
                        totalSlots += 1 + gCount
                      })

                      if (totalSlots === 0) return
                      const equalShare = Math.floor(totalAmountNum / totalSlots)
                      const remainder = totalAmountNum % totalSlots

                      const newFees: Record<string, string> = { ...feeMap }
                      const newGuestUnitPrices: Record<string, string> = {
                        ...guestUnitPriceMap,
                      }

                      selectedMembers.forEach((m, idx) => {
                        newFees[m.userId] = formatVndString(
                          (equalShare + (idx === 0 ? remainder : 0)).toString()
                        )

                        const gCount = Number(guestCountMap[m.userId] || 0)
                        if (gCount > 0) {
                          newGuestUnitPrices[m.userId] = formatVndString(
                            equalShare.toString()
                          )
                        } else {
                          newGuestUnitPrices[m.userId] = "0"
                        }
                      })

                      setFeeMap(newFees)
                      setGuestUnitPriceMap(newGuestUnitPrices)
                    }
                  }}
                >
                  {t("finance.splitEqually", "Chia đều")}
                </Button>
              </div>
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="expense-receipt-file">
              {t("finance.receiptFile", "Tệp biên lai")}
            </FieldLabel>
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

      <DialogFooter showCloseButton className="static">
        <Button
          type="submit"
          disabled={
            isPending || totalAmountNum < 1000 || allocations.length === 0
          }
          variant="orangeCard"
        >
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {mode === "create"
            ? t("finance.btnCreateExpense", "Tạo khoản chi")
            : t("finance.btnSaveChanges", "Lưu thay đổi")}
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
  const { t } = useGroupsTranslation()
  const [state, formAction, isPending] = useActionState(action, {})
  useToastState(state, t("finance.deleteSuccess", "Đã xóa thành công."), onDone)

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
          {t("activitySchedule.btnCancel", "Hủy")}
        </Button>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {t("finance.btnConfirmDelete", "Xác nhận xóa")}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function CreateTransactionButton({
  groupId,
  onClick,
}: {
  groupId: string
  onClick?: (openDialog: () => void) => void
}) {
  const { t } = useGroupsTranslation()
  const [open, setOpen] = useState(false)
  const invalidation = useFinanceInvalidation(groupId)

  return (
    <>
      <Button
        onClick={() => {
          if (onClick) {
            onClick(() => setOpen(true))
          } else {
            setOpen(true)
          }
        }}
        size="sm"
        className="border border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <Plus className="mr-2 size-4" />
        {t("finance.sendPayment", "Gửi thanh toán")}
      </Button>
      <FinanceDialogShell
        open={open}
        onOpenChange={setOpen}
        title={t("finance.sendPayment", "Gửi thanh toán")}
        description={t(
          "finance.sendPaymentDesc",
          "Gửi thông tin giao dịch bạn đã chuyển khoản cho nhóm."
        )}
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
  onClick,
}: {
  groupId: string
  members: Member[]
  onClick?: (openDialog: () => void) => void
}) {
  const { t } = useGroupsTranslation()
  const [open, setOpen] = useState(false)
  const invalidation = useFinanceInvalidation(groupId)

  return (
    <>
      <Button
        onClick={() => {
          if (onClick) {
            onClick(() => setOpen(true))
          } else {
            setOpen(true)
          }
        }}
        size="sm"
        className="border border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <Plus className="mr-2 size-4" />
        {t("finance.btnCreateExpense", "Tạo khoản chi")}
      </Button>
      <FinanceDialogShell
        open={open}
        onOpenChange={setOpen}
        title={t("finance.btnCreateExpense", "Tạo khoản chi")}
        description={t(
          "finance.createExpenseDesc",
          "Ghi nhận chi tiêu và phân bổ cho các thành viên."
        )}
        headerClassName="static"
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
  onClick,
}: {
  groupId: string
  members: Member[]
  onClick?: (openDialog: () => void) => void
}) {
  const { t } = useGroupsTranslation()
  const [open, setOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [sendEmail, setSendEmail] = useState(true)
  const [state, formAction, isPending] = useActionState(
    remindDebtAction.bind(null, groupId),
    {}
  )

  useToastState(
    state,
    t("finance.remindDebtSuccess", "Đã gửi nhắc nợ thành công."),
    () => setOpen(false)
  )

  useEffect(() => {
    if (!open) {
      setSelectedUsers([])
    }
  }, [open])

  const [nowTime] = useState(() => Date.now())

  const debtsQuery = useGroupDebts(groupId, { limit: 1000 }, { enabled: open })
  const debtsList = useMemo(
    () => debtsQuery.data?.data ?? [],
    [debtsQuery.data?.data]
  )

  const debtDetails = useMemo(() => {
    return members.reduce<
      Record<
        string,
        {
          totalDebt: number
          unpaidCount: number
          oldestDebtDate: string
          daysOverdue: number
        }
      >
    >((acc, m) => {
      const d = debtsList.find((item) => item.userId === m.userId)
      if (!d) {
        return {
          ...acc,
          [m.userId]: {
            totalDebt: 0,
            unpaidCount: 0,
            oldestDebtDate: "-",
            daysOverdue: 0,
          },
        }
      }

      let oldestDebtDate = "-"
      let daysOverdue = 0
      if (d.unpaidPayments && d.unpaidPayments.length > 0) {
        const dates = d.unpaidPayments
          .map((u) => new Date(u.createdAt))
          .filter((date) => !isNaN(date.getTime()))
        if (dates.length > 0) {
          const oldest = new Date(
            Math.min(...dates.map((date) => date.getTime()))
          )
          oldestDebtDate = oldest.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          const diff = nowTime - oldest.getTime()
          daysOverdue = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
        }
      }

      return {
        ...acc,
        [m.userId]: {
          totalDebt: d.debt,
          unpaidCount: d.unpaidPayments?.length ?? 0,
          oldestDebtDate,
          daysOverdue,
        },
      }
    }, {})
  }, [members, debtsList, nowTime])

  return (
    <>
      <Button
        onClick={() => {
          if (onClick) {
            onClick(() => setOpen(true))
          } else {
            setOpen(true)
          }
        }}
        size="sm"
        className="border border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <Send className="mr-2 size-4" />
        {t("finance.btnRemindDebt", "Nhắc nợ")}
      </Button>
      <FinanceDialogShell
        open={open}
        onOpenChange={setOpen}
        title={t("finance.remindDebtTitle", "Nhắc nợ thành viên")}
        description={t(
          "finance.remindDebtDesc",
          "Gửi thông báo nhắc nhở thành viên hoàn thành các khoản nợ."
        )}
      >
        <form action={formAction}>
          <div className="space-y-4 py-2">
            <Field>
              <FieldLabel>
                {t("finance.selectMembers", "Chọn thành viên")}
              </FieldLabel>
              <div className="max-h-[400px] space-y-3 overflow-y-auto rounded-md border p-4">
                {debtsQuery.isLoading ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    {t(
                      "finance.loadingDebtsList",
                      "Đang tải danh sách công nợ..."
                    )}
                  </div>
                ) : members.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {t("finance.noMembersFound", "Không có thành viên nào.")}
                  </div>
                ) : (
                  members.map((m) => {
                    const detail = debtDetails[m.userId]
                    const hasDebt = detail && detail.totalDebt > 0
                    return (
                      <div
                        key={m.userId}
                        className={`flex flex-col gap-2 rounded-lg border p-3 ${!hasDebt ? "bg-muted/20 opacity-60" : ""}`}
                      >
                        <label
                          className={`flex items-center gap-3 ${hasDebt ? "cursor-pointer" : "cursor-not-allowed"}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(m.userId)}
                            disabled={!hasDebt}
                            onChange={(e) => {
                              if (e.target.checked)
                                setSelectedUsers([...selectedUsers, m.userId])
                              else
                                setSelectedUsers(
                                  selectedUsers.filter((id) => id !== m.userId)
                                )
                            }}
                          />
                          <span className="font-medium">{m.name}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-auto font-semibold",
                              detail.totalDebt > 0
                                ? "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-400"
                                : "border-gray-200 bg-gray-100 text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                            )}
                          >
                            {formatCurrency(detail.totalDebt)}
                          </Badge>
                        </label>
                        <div className="ml-7 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            {t("finance.paymentCount", "Số khoản: {{count}}", {
                              count: detail.unpaidCount,
                            })}
                          </div>
                          <div
                            className={cn(
                              detail.daysOverdue > 10 &&
                                "font-semibold text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {t(
                              "finance.daysOverdue",
                              "Quá hạn: {{days}} ngày",
                              { days: detail.daysOverdue }
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </Field>
            <Field>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                />
                <span className="text-sm">
                  {t("finance.sendEmailNotice", "Gửi kèm Email thông báo")}
                </span>
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
              variant="orangeCard"
            >
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {t("finance.btnSendRemindDebt", "Gửi nhắc nợ ({{count}})", {
                count: selectedUsers.length,
              })}
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
  const { t } = useGroupsTranslation()
  const invalidation = useFinanceInvalidation(groupId)
  const [state, formAction, isPending] = useActionState(
    verifyTransactionAction.bind(null, groupId, transaction.id),
    {}
  )

  useToastState(
    state,
    t("finance.updateTxStatusSuccess", "Đã cập nhật trạng thái giao dịch."),
    () => invalidation.refreshTransactions()
  )

  if (!canManage || transaction.status !== "PENDING_REVIEW") return null

  return (
    <form action={formAction} className="flex gap-2">
      <Button
        type="submit"
        name="status"
        value="VERIFIED"
        size="xs"
        className="bg-blue-600 text-white hover:bg-blue-800"
        disabled={isPending}
      >
        {t("finance.btnApprove", "Duyệt")}
      </Button>
      <Button
        type="submit"
        name="status"
        value="REJECTED"
        size="xs"
        className="bg-red-500 text-white hover:bg-red-700"
        disabled={isPending}
      >
        {t("finance.btnReject", "Từ chối")}
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
  const { t } = useGroupsTranslation()
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
    } catch {
      toast.error(
        t(
          "finance.loadExpenseDetailFailed",
          "Không thể tải chi tiết khoản chi."
        )
      )
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
            {t("finance.btnViewDetails", "Xem chi tiết")}
          </DropdownMenuItem>
          {canManage && (
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              {t("finance.btnEdit", "Chỉnh sửa")}
            </DropdownMenuItem>
          )}
          {canManage && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteOpen(true)}
              >
                {t("finance.btnDelete", "Xóa")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <FinanceDialogShell
        open={viewOpen}
        onOpenChange={setViewOpen}
        title={t("finance.expenseDetailTitle", "Chi tiết khoản chi")}
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
                  {t("finance.amount", "Số tiền")}
                </div>
                <div className="font-semibold">
                  {formatCurrency(expenseDetail.totalAmount)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase">
                  {t("finance.expenseDate", "Ngày chi")}
                </div>
                <div className="font-semibold">
                  {formatDate(expenseDetail.expenseDate)}
                </div>
              </div>
            </div>
            {expenseDetail.description && (
              <div>
                <div className="text-xs text-muted-foreground uppercase">
                  {t("finance.description", "Mô tả")}
                </div>
                <div className="text-sm">{expenseDetail.description}</div>
              </div>
            )}
            {expenseDetail.receiptUrl && (
              <div>
                <div className="text-xs text-muted-foreground uppercase">
                  {t("finance.receipt", "Chứng từ")}
                </div>
                <PaymentReceiptPreview receiptUrl={expenseDetail.receiptUrl} />
              </div>
            )}
            <div className="rounded-md border bg-muted/20 p-3">
              <div className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                {t("finance.equipmentDetails", "Chi tiết vật dụng")}
              </div>
              <ul className="space-y-1 text-sm">
                <li>• {t("finance.buyEquipmentMock", "Mua: Banh x5")}</li>
                <li className="ml-4 text-xs text-muted-foreground">
                  - {t("finance.equipmentMockUse1", "Sử dụng cho trận 05/06")}
                </li>
                <li className="ml-4 text-xs text-muted-foreground">
                  - {t("finance.equipmentMockUse2", "Sử dụng cho buổi tập")}
                </li>
              </ul>
            </div>
            <div>
              <div className="mb-2 text-xs text-muted-foreground uppercase">
                {t("finance.allocationToMembers", "Phân bổ thành viên")}
              </div>
              <div className="space-y-2">
                {expenseDetail.allocations?.length ? (
                  expenseDetail.allocations.map((a) => (
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
                        <div className="font-semibold">
                          {formatCurrency(a.requiredFee)}
                        </div>
                        {a.guestCount && a.guestCount > 0 ? (
                          <div className="text-[10px] text-muted-foreground">
                            {t(
                              "guestFeeExplanation",
                              "(Personal: {{personal}} + {{count}} guests: {{fee}})",
                              {
                                personal: formatCurrency(
                                  a.requiredFee - (a.guestFee ?? 0)
                                ),
                                count: a.guestCount,
                                fee: formatCurrency(a.guestFee),
                              }
                            )}
                          </div>
                        ) : null}
                        <Badge
                          variant={a.status === "PAID" ? "default" : "outline"}
                          className="mt-0.5 h-4 text-[10px]"
                        >
                          {a.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("finance.none", "Không có")}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </FinanceDialogShell>

      <FinanceDialogShell
        open={editOpen}
        onOpenChange={setEditOpen}
        title={t("finance.editExpenseDialogTitle", "Chỉnh sửa khoản chi")}
        description={t(
          "finance.editExpenseDialogDesc",
          'Cập nhật khoản chi "{{title}}".',
          { title: expense.title }
        )}
        headerClassName="static"
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
        title={t("finance.deleteExpenseDialogTitle", "Xóa khoản chi")}
        description={t(
          "finance.deleteExpenseDialogDesc",
          "Thao tác này không thể hoàn tác."
        )}
      >
        <DeleteForm
          label={t(
            "finance.deleteExpenseConfirmLabel",
            'Bạn có chắc muốn xóa khoản chi "{{title}}" không?',
            { title: expense.title }
          )}
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
