"use client"

import { useQueries, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  financeQueryKeys,
  getFinanceSummaryClient,
  getGroupMembersClient,
  listCreditBalancesClient,
  listExpensesClient,
  listFundPaymentsClient,
  listFundsClient,
  listMyFundsClient,
} from "../api/finance-client"
import type { Member } from "../types"
import type { ExpenseItem, FundItem, FundPayment } from "../types/finance"
import { isArchivedGroup } from "../utils/group-status"
import {
  CreateExpenseButton,
  CreateFundButton,
  ExpenseRowActions,
  FundRowActions,
  PaymentReceiptPreview,
  PaymentVerifyRow,
} from "./finance-item-actions"
import { useGroupDetailActiveTab } from "./group-detail-tabs"

function formatCurrency(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "-"

  const numericValue = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(numericValue)) {
    return String(value ?? "-")
  }

  return new Intl.NumberFormat("vi-VN").format(numericValue)
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

function formatDateTime(value?: string | null) {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatPaymentStatus(status?: string | null) {
  const normalized = status?.toUpperCase()

  if (normalized === "PAID") {
    return "Đã thanh toán"
  }

  if (normalized === "UNPAID") {
    return "Chưa thanh toán"
  }

  if (normalized === "REJECTED") {
    return "Đã từ chối"
  }

  if (normalized === "PENDING") {
    return "Đang chờ"
  }

  return status ?? "-"
}

function getPaymentStatusVariant(status?: string | null) {
  const normalized = status?.toUpperCase()

  if (normalized === "PAID") {
    return "default" as const
  }

  if (normalized === "PENDING") {
    return "secondary" as const
  }

  if (normalized === "REJECTED") {
    return "destructive" as const
  }

  return "outline" as const
}

function getPaymentPayerName(payment: FundPayment) {
  return (
    payment.user?.name ||
    payment.userName ||
    (payment.userId ? `ID: ${payment.userId.slice(0, 8)}` : "Thành viên")
  )
}

function getPaymentPayerAvatar(payment: FundPayment) {
  return payment.user?.avatarUrl || payment.userAvatarUrl || ""
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (!words.length) {
    return "TV"
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
}

function getFundPaymentStats(payments: FundPayment[]) {
  let paid = 0
  let pending = 0

  for (const payment of payments) {
    const normalized = payment.status?.toUpperCase()
    if (normalized === "PAID") {
      paid += 1
      continue
    }

    if (normalized === "PENDING") {
      pending += 1
    }
  }

  return {
    paid,
    pending,
    totalMembers: payments.length,
    unpaid: Math.max(payments.length - paid - pending, 0),
  }
}

function getPaymentSortRank(status?: string | null) {
  const normalized = status?.toUpperCase()

  if (normalized === "PENDING") return 0
  if (normalized === "REJECTED") return 1
  if (normalized === "PAID") return 2

  return 3
}

function getPendingPayments(payments: FundPayment[]) {
  return payments.filter(
    (payment) => payment.status?.toUpperCase() === "PENDING"
  )
}

function PaymentCountChip({
  label,
  value,
  variant,
}: {
  label: string
  value: number
  variant: "default" | "secondary" | "outline"
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5">
      <Badge variant={variant}>{value}</Badge>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function FundPaymentPreviewList({
  groupId,
  fundId,
  payments,
  previewCount,
  canManage,
  emptyLabel,
  showQuickActions,
  members,
}: {
  groupId: string
  fundId: string
  payments: FundPayment[]
  previewCount: number
  canManage: boolean
  emptyLabel: string
  showQuickActions: boolean
  members: Member[]
}) {
  if (!payments.length) {
    return <p className="text-xs text-muted-foreground">{emptyLabel}</p>
  }

  const previewItems = payments.slice(0, previewCount)
  const moreCount = Math.max(payments.length - previewCount, 0)

  return (
    <div className="space-y-2">
      {previewItems.map((payment) => {
        const name = getPaymentPayerName(payment)
        const statusLabel = formatPaymentStatus(payment.status)
        const statusVariant = getPaymentStatusVariant(payment.status)

        return (
          <div
            key={payment.id}
            className="rounded-md border bg-background/60 p-3"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Avatar size="sm" className="shrink-0">
                  <AvatarImage
                    src={getPaymentPayerAvatar(payment)}
                    alt={name}
                  />
                  <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium">{name}</span>
                    <Badge variant={statusVariant} className="shrink-0">
                      {statusLabel}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>Yêu cầu: {formatCurrency(payment.requiredAmount ?? 0)}</span>
                    <span>Đã dùng credit: {formatCurrency(payment.creditUsed ?? 0)}</span>
                    <span>Đã đóng: {formatCurrency(payment.amountPaid ?? 0)}</span>
                    <span>
                      Còn thiếu: {formatCurrency(Math.max(0, Number(payment.requiredAmount ?? 0) - Number(payment.creditUsed ?? 0) - Number(payment.amountPaid ?? 0)))}
                    </span>
                    <span>
                      Số dư hiện có: {formatCurrency(
                        (
                          members.find(
                            (mm) => mm.userId === payment.userId
                          ) as Member & { creditBalance?: number }
                        )?.creditBalance ?? 0
                      )}
                    </span>
                    <span>
                      Gửi lúc: {formatDateTime(payment.paidAt ?? null)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:self-center">
                {payment.paymentReceiptUrl && (
                  <PaymentReceiptPreview
                    receiptUrl={payment.paymentReceiptUrl}
                  />
                )}

                {showQuickActions && canManage && (
                  <PaymentVerifyRow
                    groupId={groupId}
                    fundId={fundId}
                    payment={payment}
                    compact
                    className="md:self-center"
                  />
                )}
              </div>
            </div>
          </div>
        )
      })}

      {moreCount > 0 && (
        <p className="text-xs text-muted-foreground">+{moreCount} người khác</p>
      )}
    </div>
  )
}

function FundListItemCard({
  groupId,
  fund,
  members,
  canManage,
  canPay,
  currentUserId,
}: {
  groupId: string
  fund: FundItem & { payments: FundPayment[] }
  members: Member[]
  canManage: boolean
  canPay: boolean
  currentUserId: string
}) {
  const payments = fund.payments ?? []
  const {
    paymentStats,
    paymentProgressPercent,
    sortedPreviewPayments,
    pendingPayments,
    canPayThisFund,
    defaultPreviewCount,
  } = useMemo(() => {
    const nextPaymentStats = getFundPaymentStats(payments)
    const nextPaymentProgressPercent =
      nextPaymentStats.totalMembers > 0
        ? Math.round((nextPaymentStats.paid / nextPaymentStats.totalMembers) * 100)
        : 0
    const nextSortedPreviewPayments = [...payments].sort((a, b) => {
      return getPaymentSortRank(a.status) - getPaymentSortRank(b.status)
    })
    const nextPendingPayments = getPendingPayments(nextSortedPreviewPayments)
    const myPayment = payments.find((payment) => payment.userId === currentUserId)
    const myStatus = myPayment?.status?.toUpperCase() ?? null
    const nextCanSubmitPayment =
      !!myPayment && myStatus !== "PAID" && myStatus !== "PENDING"
    return {
      paymentStats: nextPaymentStats,
      paymentProgressPercent: nextPaymentProgressPercent,
      sortedPreviewPayments: nextSortedPreviewPayments,
      pendingPayments: nextPendingPayments,
      canPayThisFund: canPay && nextCanSubmitPayment,
      defaultPreviewCount: nextPaymentStats.totalMembers > 8 ? 3 : 4,
    }
  }, [canPay, currentUserId, payments])

  return (
    <AccordionItem
      value={fund.id}
      className="overflow-hidden rounded-lg border bg-card data-[state=open]:border-primary/40"
    >
      <AccordionTrigger className="px-4 py-4 hover:no-underline">
        <div className="flex w-full min-w-0 flex-col gap-3 pr-2 text-left">
          <div className="min-w-0 space-y-1.5">
            <p className="truncate text-base font-semibold">{fund.title}</p>
            {fund.description && (
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {fund.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Số tiền: {formatCurrency(fund.requiredAmount)}</span>
              <span>Hạn chót: {formatDate(fund.deadline ?? null)}</span>
              <span>Tạo bởi: {fund.createdBy?.name ?? "-"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {paymentStats.paid}/{paymentStats.totalMembers} đã thanh toán
              </span>
              <span>{paymentProgressPercent}% hoàn thành</span>
            </div>
            <Progress value={paymentProgressPercent} />
          </div>

          <div className="flex flex-wrap gap-2">
            <PaymentCountChip
              label="Đã thanh toán"
              value={paymentStats.paid}
              variant="default"
            />
            <PaymentCountChip
              label="Chờ duyệt"
              value={paymentStats.pending}
              variant="secondary"
            />
            <PaymentCountChip
              label="Chưa gửi"
              value={paymentStats.unpaid}
              variant="outline"
            />
          </div>
        </div>
      </AccordionTrigger>

      <div className="border-t px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Duyệt thanh toán nhanh</p>
              <Badge
                variant={paymentStats.pending > 0 ? "secondary" : "outline"}
              >
                {paymentStats.pending} chờ duyệt
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Xem nhanh các yêu cầu đang chờ và duyệt ngay tại danh sách quỹ.
            </p>
          </div>

          <div className="shrink-0 self-start lg:self-auto">
            <FundRowActions
              groupId={groupId}
              fund={fund}
              members={members}
              canManage={canManage}
              canPay={canPayThisFund}
              payments={payments}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <FundPaymentPreviewList
            groupId={groupId}
            fundId={fund.id}
              payments={pendingPayments}
            previewCount={Math.min(pendingPayments.length, defaultPreviewCount)}
            canManage={canManage}
            emptyLabel="Chưa có yêu cầu thanh toán nào đang chờ duyệt."
            showQuickActions
              members={members}
          />
        </div>
      </div>

      <AccordionContent>
        <div className="border-t px-4 pt-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Tất cả thanh toán</p>
            <p className="text-xs text-muted-foreground">
              {payments.length} giao dịch
            </p>
          </div>
          <FundPaymentPreviewList
            groupId={groupId}
            fundId={fund.id}
            payments={sortedPreviewPayments}
            previewCount={Math.min(sortedPreviewPayments.length, 10)}
            canManage={canManage}
            emptyLabel="Chưa có dữ liệu thanh toán của thành viên."
            showQuickActions={false}
            members={members}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function GroupFinanceSection({
  groupId,
  members,
  currentUserId,
  currentUserRole,
  groupStatus,
}: {
  groupId: string
  members: Member[]
  currentUserId: string
  currentUserRole: string | null
  groupStatus?: string | null
}) {
  const activeTab = useGroupDetailActiveTab()
  const normalizedRole = currentUserRole?.toLowerCase() ?? ""
  const canManage =
    !isArchivedGroup(groupStatus) &&
    (normalizedRole === "owner" || normalizedRole === "admin")

  const isFinanceActive = activeTab === "finance"

  const summaryQuery = useQuery({
    queryKey: financeQueryKeys.summary(groupId),
    queryFn: () => getFinanceSummaryClient(groupId),
    enabled: isFinanceActive,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  const fundsQuery = useQuery({
    queryKey: financeQueryKeys.funds(groupId),
    queryFn: () => listFundsClient(groupId),
    enabled: isFinanceActive,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  const myFundsQuery = useQuery({
    queryKey: financeQueryKeys.myFunds(groupId),
    queryFn: () => listMyFundsClient(groupId),
    enabled: isFinanceActive,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  const expensesQuery = useQuery({
    queryKey: financeQueryKeys.expenses(groupId),
    queryFn: () => listExpensesClient(groupId),
    enabled: isFinanceActive,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  const funds = fundsQuery.data?.data ?? []
  const myFunds = myFundsQuery.data?.data ?? []
  const expenses = expensesQuery.data?.data ?? []
  const membersQuery = useQuery({
    queryKey: financeQueryKeys.members(groupId),
    queryFn: () => getGroupMembersClient(groupId),
    enabled: isFinanceActive && members.length === 0,
    initialData: members.length > 0 ? members : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
  const creditBalancesQuery = useQuery({
    queryKey: financeQueryKeys.creditBalances(groupId),
    queryFn: () => listCreditBalancesClient(groupId, { limit: 1000 }),
    enabled: isFinanceActive,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const baseMembers = members.length > 0 ? members : membersQuery.data ?? []

  const resolvedMembers = baseMembers.map((m) => {
    const found = creditBalancesQuery.data?.data?.find((b) => b.userId === m.userId)
    return { ...m, creditBalance: found?.creditBalance ?? 0 }
  })

  const fundPaymentsQueries = useQueries({
    queries: funds.map((fund) => ({
      queryKey: financeQueryKeys.fundPayments(groupId, fund.id),
      queryFn: () => listFundPaymentsClient(groupId, fund.id),
      enabled: isFinanceActive,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })),
  })

  const fundsWithPayments: Array<FundItem & { payments: FundPayment[] }> =
    useMemo(
      () =>
        funds.map((fund, index) => ({
          ...fund,
          payments: fundPaymentsQueries[index]?.data?.data ?? [],
        })),
      [fundPaymentsQueries, funds]
    )

  if (!isFinanceActive) {
    return (
      <Card className="mt-6 shadow-sm">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Thu chi nhóm</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Tổng quan tài chính, quỹ và khoản chi của nhóm.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Mở tab Thu chi để tải dữ liệu tài chính khi cần.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (
    summaryQuery.isError ||
    fundsQuery.isError ||
    myFundsQuery.isError ||
    expensesQuery.isError
  ) {
    return null
  }

  const summaryResult = summaryQuery.data

  if (!summaryResult) {
    return (
      <Card className="mt-6 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>Thu chi nhóm</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu tài chính...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6 shadow-sm">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Thu chi nhóm</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Tổng quan tài chính, quỹ và khoản chi của nhóm.
            </p>
          </div>
          {canManage && !isArchivedGroup(groupStatus) && (
            <div className="flex flex-wrap gap-2">
              <CreateFundButton groupId={groupId} members={resolvedMembers} />
              <CreateExpenseButton groupId={groupId} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Tổng quỹ"
            value={formatCurrency(summaryResult.totalFunds)}
            description={`Số quỹ hiện có: ${summaryResult.fundCount}`}
          />
          <SummaryCard
            title="Tổng đã thu"
            value={formatCurrency(summaryResult.totalCollected)}
            description="Tổng tiền thành viên đã thanh toán."
          />
          <SummaryCard
            title="Tổng khoản chi"
            value={formatCurrency(summaryResult.totalExpenses)}
            description={`Số khoản chi hiện có: ${summaryResult.expenseCount}`}
          />
          <SummaryCard
            title="Cân đối"
            value={formatCurrency(summaryResult.netBalance)}
            description={`Đang chờ: ${formatCurrency(summaryResult.totalPending)} | Còn nợ: ${formatCurrency(summaryResult.totalOwed)}`}
          />
        </div>

        <Tabs defaultValue="funds">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="funds">Quỹ</TabsTrigger>
            <TabsTrigger value="my-funds">Của tôi</TabsTrigger>
            <TabsTrigger value="expenses">Khoản chi</TabsTrigger>
          </TabsList>

          <TabsContent value="funds" className="mt-4">
            <FinanceTableHeader
              title="Danh sách quỹ"
              description="Tất cả quỹ trong nhóm."
            />
            <FinanceFundsTable
              groupId={groupId}
              funds={fundsWithPayments}
              members={resolvedMembers}
              canManage={canManage}
              // Only allow pay when group is not archived AND current user has a payment record
              // whose status allows submitting a payment (UNPAID or REJECTED). Backend rejects PAID and PENDING.
              canPay={!isArchivedGroup(groupStatus)}
              currentUserId={currentUserId}
            />
          </TabsContent>

          <TabsContent value="my-funds" className="mt-4">
            <FinanceTableHeader
              title="Quỹ của tôi"
              description="Các quỹ kèm trạng thái thanh toán của bạn."
            />
            <FinanceMyFundsTable
              groupId={groupId}
              funds={myFunds}
              members={resolvedMembers}
              canPay={!isArchivedGroup(groupStatus)}
              currentUserId={currentUserId}
            />
          </TabsContent>

          <TabsContent value="expenses" className="mt-4">
            <FinanceTableHeader
              title="Danh sách khoản chi"
              description="Các khoản chi đã ghi nhận trong nhóm."
            />
            <FinanceExpensesTable
              groupId={groupId}
              expenses={expenses}
              canManage={canManage}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function FinanceTableHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-3 flex flex-col gap-1">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function FinanceFundsTable({
  groupId,
  funds,
  members,
  canManage,
  canPay,
  currentUserId,
}: {
  groupId: string
  funds: Array<FundItem & { payments: FundPayment[] }>
  members: Member[]
  canManage: boolean
  canPay: boolean
  currentUserId: string
}) {
  if (!funds.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có quỹ nào trong nhóm.
      </p>
    )
  }

  return (
    <Accordion type="multiple" className="space-y-3">
      {funds.map((fund) => (
        <FundListItemCard
          key={fund.id}
          groupId={groupId}
          fund={fund}
          members={members}
          canManage={canManage}
          canPay={canPay}
          currentUserId={currentUserId}
        />
      ))}
    </Accordion>
  )
}

function FinanceMyFundsTable({
  groupId,
  funds,
  members,
  canPay,
  currentUserId,
}: {
  groupId: string
  funds: FundItem[]
  members: Member[]
  canPay: boolean
  currentUserId: string
}) {
  if (!funds.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Bạn chưa có quỹ nào trong nhóm.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên</TableHead>
          <TableHead>Tổng quỹ</TableHead>
          <TableHead>Tôi phải đóng</TableHead>
          <TableHead>Đã dùng credit</TableHead>
          <TableHead>Đã đóng</TableHead>
          <TableHead>Còn thiếu</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {funds.map((fund) => {
          const payment = fund.payments?.[0]
          const required = Number(payment?.requiredAmount ?? 0)
          const paid = Number(payment?.amountPaid ?? 0)
          const creditUsed = Number(payment?.creditUsed ?? 0)
          const remaining = Math.max(0, required - creditUsed - paid)

          return (
            <TableRow key={fund.id} className="border-b last:border-b-0">
              <TableCell className="font-medium">{fund.title}</TableCell>
              <TableCell>{formatCurrency(fund.requiredAmount)}</TableCell>
              <TableCell>{formatCurrency(required)}</TableCell>
              <TableCell>{formatCurrency(creditUsed)}</TableCell>
              <TableCell>{formatCurrency(paid)}</TableCell>
              <TableCell>{formatCurrency(remaining)}</TableCell>
              <TableCell>
                {(() => {
                  // Determine status based on backend status and computed remaining
                  const backendStatus = payment?.status?.toUpperCase() ?? null
                  const computedPaidOff = remaining <= 0
                  const statusLabel = computedPaidOff ? "Đã thanh toán" : formatPaymentStatus(payment?.status ?? null)
                  const badgeVariant = computedPaidOff ? "default" : (backendStatus === "PENDING" ? "secondary" : backendStatus === "REJECTED" ? "destructive" : "outline")

                  return <Badge variant={badgeVariant}>{statusLabel}</Badge>
                })()}
              </TableCell>
              <TableCell className="text-right">
                {(() => {
                  const status = payment?.status?.toUpperCase() ?? null
                  const canSubmitPayment =
                    !!payment && status !== "PAID" && status !== "PENDING"

                  return (
                    <FundRowActions
                      groupId={groupId}
                      fund={fund}
                      members={members}
                      canManage={false}
                      canPay={canPay && !!payment?.id && canSubmitPayment}
                      payments={fund.payments ?? []}
                    />
                  )
                })()}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

function FinanceExpensesTable({
  groupId,
  expenses,
  canManage,
}: {
  groupId: string
  expenses: ExpenseItem[]
  canManage: boolean
}) {
  if (!expenses.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có khoản chi nào trong nhóm.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên</TableHead>
          <TableHead>Số tiền</TableHead>
          <TableHead>Ngày chi</TableHead>
          <TableHead>Người tạo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col gap-1">
                <span>{expense.title}</span>
                {expense.description && (
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {expense.description}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>{formatCurrency(expense.amount)}</TableCell>
            <TableCell>{formatDate(expense.expenseDate ?? null)}</TableCell>
            <TableCell className="text-muted-foreground">
              {expense.createdBy?.name ?? "-"}
            </TableCell>
            <TableCell className="text-right">
              <ExpenseRowActions
                groupId={groupId}
                expense={expense}
                canManage={canManage}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
