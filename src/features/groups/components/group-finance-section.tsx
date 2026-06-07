"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { ErrorSection } from "@/components/error-section"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { formatCurrencyVnd } from "@/utils/expense-utils"

import {
  financeQueryKeys,
  getFinanceSummaryClient,
  getGroupMembersClient,
  getMyDebtClient,
  listCreditBalancesClient,
  listExpensesClient,
  listTransactionsClient,
} from "../api/finance-client"
import type { Member } from "../types"
import type {
  CreditBalanceEntry,
  DebtItem,
  ExpenseItem,
  MyDebt,
  Transaction,
} from "../types/finance"
import { isArchivedGroup } from "../utils/group-status"
import {
  CreateExpenseButton,
  CreateTransactionButton,
  ExpenseRowActions,
  PaymentReceiptPreview,
  RemindDebtButton,
  TransactionRowActions,
} from "./finance-item-actions"
import { useGroupDetailActiveTab } from "./group-detail-tabs"

function formatCurrency(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "-"
  const numericValue = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(numericValue)) return String(value ?? "-")
  return formatCurrencyVnd(numericValue)
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

function formatTransactionStatus(status?: string | null) {
  const normalized = status?.toUpperCase()
  if (normalized === "VERIFIED") return "Đã xác nhận"
  if (normalized === "REJECTED") return "Đã từ chối"
  if (normalized === "PENDING_REVIEW") return "Chờ duyệt"
  return status ?? "-"
}

function getTransactionStatusVariant(status?: string | null) {
  const normalized = status?.toUpperCase()
  if (normalized === "VERIFIED") return "default" as const
  if (normalized === "PENDING_REVIEW") return "secondary" as const
  if (normalized === "REJECTED") return "destructive" as const
  return "outline" as const
}

function formatDebtStatus(status?: string | null) {
  const normalized = status?.toUpperCase()
  if (normalized === "PAID") return "Đã trả đủ"
  if (normalized === "PARTIALLY_PAID") return "Trả một phần"
  if (normalized === "UNPAID") return "Chưa trả"
  if (normalized === "OVERPAID") return "Trả dư"
  return status ?? "-"
}

function getDebtStatusVariant(status?: string | null) {
  const normalized = status?.toUpperCase()
  if (normalized === "PAID") return "default" as const
  if (normalized === "PARTIALLY_PAID") return "secondary" as const
  if (normalized === "UNPAID") return "destructive" as const
  return "outline" as const
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "TV"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase()
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

function getQueryErrorMessage(error: unknown, fallback: string) {
  if (!error) return fallback
  if (typeof error === "string") return error
  if (error instanceof Error && error.message) return error.message
  return fallback
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
  })

  const transactionsQuery = useQuery({
    queryKey: financeQueryKeys.transactions(groupId),
    queryFn: () => listTransactionsClient(groupId),
    enabled: isFinanceActive && canManage,
  })

  const myDebtQuery = useQuery({
    queryKey: financeQueryKeys.myDebt(groupId),
    queryFn: () => getMyDebtClient(groupId),
    enabled: isFinanceActive,
  })

  const expensesQuery = useQuery({
    queryKey: financeQueryKeys.expenses(groupId),
    queryFn: () => listExpensesClient(groupId),
    enabled: isFinanceActive,
  })

  const creditBalancesQuery = useQuery({
    queryKey: financeQueryKeys.creditBalances(groupId),
    queryFn: () => listCreditBalancesClient(groupId),
    enabled: isFinanceActive,
  })

  const membersQuery = useQuery({
    queryKey: financeQueryKeys.members(groupId),
    queryFn: () => getGroupMembersClient(groupId),
    enabled: isFinanceActive && members.length === 0,
    initialData: members.length > 0 ? members : undefined,
  })

  const resolvedMembers = membersQuery.data ?? []

  if (!isFinanceActive) {
    return (
      <Card className="mt-6 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>Thu chi nhóm</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng quan tài chính nhóm.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Mở tab Thu chi để tải dữ liệu.
          </p>
        </CardContent>
      </Card>
    )
  }

  const summary = summaryQuery.data

  return (
    <Card className="mt-6 shadow-sm">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Thu chi nhóm</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {canManage
                ? "Tổng quan tài chính, giao dịch và khoản nợ của nhóm."
                : "Theo dõi các khoản nợ và gửi thông tin thanh toán của bạn."}
            </p>
          </div>
          {!isArchivedGroup(groupStatus) && (
            <div className="flex flex-wrap gap-2">
              <CreateTransactionButton groupId={groupId} />
              {canManage && (
                <>
                  <CreateExpenseButton
                    groupId={groupId}
                    members={resolvedMembers}
                  />
                  <RemindDebtButton
                    groupId={groupId}
                    members={resolvedMembers}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {summaryQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Đang tải tổng quan...</p>
        ) : summaryQuery.isError ? (
          <ErrorSection
            title="Lỗi tải tổng quan"
            message={getQueryErrorMessage(summaryQuery.error, "Thử lại sau.")}
          />
        ) : summary ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              title="Tổng chi tiêu"
              value={formatCurrency(summary.totalExpense)}
              description={`Cân đối: ${formatCurrency(summary.netBalance)}`}
            />
            <SummaryCard
              title="Tổng đã thu"
              value={formatCurrency(summary.totalCollected)}
              description={`Chờ duyệt: ${formatCurrency(summary.totalExpectedRevenue - summary.totalCollected)}`}
            />
            <SummaryCard
              title="Còn nợ"
              value={formatCurrency(summary.outstandingAmount)}
              description={`Kỳ vọng thu: ${formatCurrency(summary.totalExpectedRevenue)}`}
            />
          </div>
        ) : null}

        <Tabs defaultValue={canManage ? "transactions" : "my-debt"}>
          <TabsList>
            {canManage && (
              <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
            )}
            <TabsTrigger value="my-debt">Nợ của tôi</TabsTrigger>
            <TabsTrigger value="expenses">Khoản chi</TabsTrigger>
            <TabsTrigger value="credits">Tín dụng</TabsTrigger>
          </TabsList>

          {canManage && (
            <TabsContent value="transactions" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thành viên</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Ngày gửi</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Chứng từ</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsQuery.data?.data?.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={tx.user?.avatarUrl || ""} />
                              <AvatarFallback>
                                {getInitials(tx.user?.name || "TV")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {tx.user?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(tx.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getTransactionStatusVariant(tx.status)}
                          >
                            {formatTransactionStatus(tx.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tx.receiptUrl && (
                            <PaymentReceiptPreview receiptUrl={tx.receiptUrl} />
                          )}
                        </TableCell>
                        <TableCell>
                          <TransactionRowActions
                            groupId={groupId}
                            transaction={tx}
                            canManage={canManage}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {!transactionsQuery.data?.data?.length && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-4 text-center text-muted-foreground"
                        >
                          Chưa có giao dịch nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          )}

          <TabsContent value="my-debt" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khoản chi</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Yêu cầu</TableHead>
                    <TableHead>Đã trả</TableHead>
                    <TableHead>Còn nợ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myDebtQuery.data?.items?.map((item) => (
                    <TableRow key={item.expenseId}>
                      <TableCell className="font-medium">
                        {item.expenseTitle}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(item.expenseDate)}
                      </TableCell>
                      <TableCell>{formatCurrency(item.requiredFee)}</TableCell>
                      <TableCell className="text-success">
                        {formatCurrency(item.paidAmount)}
                      </TableCell>
                      <TableCell className="font-medium text-destructive">
                        {formatCurrency(
                          Math.max(0, item.requiredFee - item.paidAmount)
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getDebtStatusVariant(item.status)}>
                          {formatDebtStatus(item.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!myDebtQuery.data?.items?.length && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-4 text-center text-muted-foreground"
                      >
                        Bạn không có khoản nợ nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {myDebtQuery.data && (
                <div className="border-t p-4 text-right font-semibold">
                  Tổng nợ hiện tại:{" "}
                  <span className="text-lg text-destructive">
                    {formatCurrency(myDebtQuery.data.totalDebt)}
                  </span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên khoản chi</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Ngày chi</TableHead>
                    <TableHead>Người tạo</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expensesQuery.data?.data?.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="font-medium">{exp.title}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(exp.totalAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(exp.expenseDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {exp.createdBy?.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <ExpenseRowActions
                          groupId={groupId}
                          expense={exp}
                          members={resolvedMembers}
                          canManage={canManage}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!expensesQuery.data?.data?.length && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-4 text-center text-muted-foreground"
                      >
                        Chưa có khoản chi nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="credits" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {creditBalancesQuery.data?.data?.map((entry) => (
                <Card
                  key={entry.userId}
                  className="flex items-center gap-4 p-4"
                >
                  <Avatar>
                    <AvatarImage src={entry.user?.avatarUrl || ""} />
                    <AvatarFallback>
                      {getInitials(entry.user?.name || "TV")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{entry.user?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.user?.email}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {formatCurrency(entry.creditBalance)}
                  </Badge>
                </Card>
              ))}
              {!creditBalancesQuery.data?.data?.length && (
                <div className="col-span-full py-10 text-center text-muted-foreground">
                  Không có thành viên nào có số dư tín dụng.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
