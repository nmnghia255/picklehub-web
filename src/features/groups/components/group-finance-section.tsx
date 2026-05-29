import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
  getFinanceSummary,
  listExpenses,
  listFundPayments,
  listFunds,
  listMyFunds,
} from "../api/finance-service"
import type { ExpenseItem, FundItem, FundPayment } from "../types/finance"
import { isArchivedGroup } from "../utils/group-status"
import {
  CreateExpenseButton,
  CreateFundButton,
  ExpenseRowActions,
  PaymentReceiptPreview,
  PaymentVerifyRow,
  FundRowActions,
} from "./finance-item-actions"

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
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

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
  return payments.filter((payment) => payment.status?.toUpperCase() === "PENDING")
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
}: {
  groupId: string
  fundId: string
  payments: FundPayment[]
  previewCount: number
  canManage: boolean
  emptyLabel: string
  showQuickActions: boolean
}) {
  if (!payments.length) {
    return (
      <p className="text-xs text-muted-foreground">{emptyLabel}</p>
    )
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
                  <AvatarImage src={getPaymentPayerAvatar(payment)} alt={name} />
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
                    <span>Số tiền: {formatCurrency(payment.amountPaid)}</span>
                    <span>Gửi lúc: {formatDateTime(payment.paidAt ?? null)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:self-center">
                {payment.paymentReceiptUrl && (
                  <PaymentReceiptPreview receiptUrl={payment.paymentReceiptUrl} />
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
  canManage,
  canPay,
  currentUserId,
}: {
  groupId: string
  fund: FundItem & { payments: FundPayment[] }
  canManage: boolean
  canPay: boolean
  currentUserId: string
}) {
  const payments = fund.payments ?? []
  const paymentStats = getFundPaymentStats(payments)
  const paymentProgressPercent =
    paymentStats.totalMembers > 0
      ? Math.round((paymentStats.paid / paymentStats.totalMembers) * 100)
      : 0

  const sortedPreviewPayments = [...payments].sort((a, b) => {
    return getPaymentSortRank(a.status) - getPaymentSortRank(b.status)
  })
  const pendingPayments = getPendingPayments(sortedPreviewPayments)

  const myPayment = payments.find((payment) => payment.userId === currentUserId)
  const myStatus = myPayment?.status?.toUpperCase() ?? null
  const canSubmitPayment = !!myPayment && myStatus !== "PAID" && myStatus !== "PENDING"
  const canPayThisFund = canPay && canSubmitPayment
  const defaultPreviewCount = paymentStats.totalMembers > 8 ? 3 : 4

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
              <span>Số tiền: {formatCurrency(fund.amount)}</span>
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
              <Badge variant={paymentStats.pending > 0 ? "secondary" : "outline"}>
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

export async function GroupFinanceSection({
  groupId,
  currentUserId,
  currentUserRole,
  groupStatus,
}: {
  groupId: string
  currentUserId: string
  currentUserRole: string | null
  groupStatus?: string | null
}) {
  const normalizedRole = currentUserRole?.toLowerCase() ?? ""
  const canManage =
    !isArchivedGroup(groupStatus) &&
    (normalizedRole === "owner" || normalizedRole === "admin")

  const [summaryResult, fundsResult, myFundsResult, expensesResult] =
    await Promise.all([
      getFinanceSummary(groupId).catch(() => null),
      listFunds(groupId).catch(() => null),
      listMyFunds(groupId).catch(() => null),
      listExpenses(groupId).catch(() => null),
    ])

  if (!summaryResult || !fundsResult || !myFundsResult || !expensesResult) {
    return null
  }

  const funds = fundsResult.data ?? []
  const myFunds = myFundsResult.data ?? []
  const expenses = expensesResult.data ?? []
  const fundsWithPayments: Array<FundItem & { payments: FundPayment[] }> =
    await Promise.all(
      funds.map(async (fund) => {
        const paymentResult = await listFundPayments(groupId, fund.id).catch(
          () => null
        )
        return {
          ...fund,
          payments: paymentResult?.data ?? [],
        }
      })
    )

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
              <CreateFundButton groupId={groupId} />
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
  canManage,
  canPay,
  currentUserId,
}: {
  groupId: string
  funds: Array<FundItem & { payments: FundPayment[] }>
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
  canPay,
  currentUserId,
}: {
  groupId: string
  funds: FundItem[]
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
          <TableHead>Số tiền</TableHead>
          <TableHead>Trạng thái</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {funds.map((fund) => {
          const payment = fund.payments?.[0]
          return (
            <TableRow key={fund.id} className="border-b last:border-b-0">
              <TableCell className="font-medium">{fund.title}</TableCell>
              <TableCell>{formatCurrency(fund.amount)}</TableCell>
              <TableCell>
                {(() => {
                  const status = payment?.status?.toUpperCase() ?? null
                  const statusLabel = formatPaymentStatus(
                    payment?.status ?? null
                  )
                  const badgeVariant =
                    status === "PAID"
                      ? "default"
                      : status === "PENDING"
                        ? "secondary"
                        : status === "REJECTED"
                          ? "destructive"
                          : "outline"

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
