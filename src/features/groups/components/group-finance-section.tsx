import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên</TableHead>
          <TableHead>Số tiền</TableHead>
          <TableHead>Hạn chót</TableHead>
          <TableHead>Người tạo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {funds.map((fund) => (
          <TableRow key={fund.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col gap-1">
                <span>{fund.title}</span>
                {fund.description && (
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {fund.description}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>{formatCurrency(fund.amount)}</TableCell>
            <TableCell>{formatDate(fund.deadline ?? null)}</TableCell>
            <TableCell className="text-muted-foreground">
              {fund.createdBy?.name ?? "-"}
            </TableCell>
            <TableCell className="text-right">
              {(() => {
                const myPayment = (fund.payments ?? []).find(
                  (p) => p.userId === currentUserId
                )
                const status = myPayment?.status?.toUpperCase() ?? null
                const canSubmitPayment =
                  !!myPayment && status !== "PAID" && status !== "PENDING"

                return (
                  <FundRowActions
                    groupId={groupId}
                    fund={fund}
                    canManage={canManage}
                    canPay={canPay && canSubmitPayment}
                    payments={fund.payments ?? []}
                  />
                )
              })()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
