"use client"

import { Check, Copy, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  type PublicPaymentActionState,
  updatePublicPlaySessionPaymentAction,
} from "@/features/play-sessions/actions/public-play-session-payment"
import type { GroupPlaySession } from "@/features/play-sessions/types"

interface PublicPlaySessionPaymentCardProps {
  session: GroupPlaySession
  isHost: boolean
  myParticipationStatus?: string
  myPaymentStatus?: "UNPAID" | "PENDING_REVIEW" | "PAID" | string
}

const initialState: PublicPaymentActionState = {}

export function PublicPlaySessionPaymentCard({
  session,
  isHost,
  myParticipationStatus,
  myPaymentStatus,
}: PublicPlaySessionPaymentCardProps) {
  const router = useRouter()
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const [paymentState, paymentAction, isUpdatingPayment] = useActionState(
    updatePublicPlaySessionPaymentAction.bind(null, session.id),
    initialState
  )

  const hasPaymentInfo =
    !!session.paymentQrUrl || !!session.paymentCode || !!session.paymentNote

  const normalizedPaymentStatus = useMemo(
    () => String(myPaymentStatus ?? "UNPAID").toUpperCase(),
    [myPaymentStatus]
  )

  const isOfficialParticipant = useMemo(
    () => String(myParticipationStatus ?? "").toUpperCase() === "CONFIRMED",
    [myParticipationStatus]
  )

  useEffect(() => {
    if (!paymentState.success) {
      return
    }

    router.refresh()
  }, [paymentState.success, router])

  const handleCopyPaymentCode = async () => {
    if (!session.paymentCode) {
      return
    }

    await navigator.clipboard.writeText(session.paymentCode)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Thanh toán</CardTitle>
        {isHost && (
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="outline">
                <Pencil className="size-4" />
                {hasPaymentInfo ? "Chỉnh sửa" : "Cài đặt thanh toán"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cập nhật thông tin thanh toán</DialogTitle>
                <DialogDescription>
                  Cấu hình QR, mã chuyển khoản và ghi chú để người tham gia
                  chuyển khoản.
                </DialogDescription>
              </DialogHeader>

              <form
                action={(formData) => {
                  startTransition(() => paymentAction(formData))
                }}
                className="space-y-4"
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="paymentQrUrl">URL QR code</FieldLabel>
                    <Input
                      id="paymentQrUrl"
                      name="paymentQrUrl"
                      type="text"
                      placeholder="https://..."
                      defaultValue={session.paymentQrUrl ?? ""}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="paymentCode">
                      Mã chuyển khoản
                    </FieldLabel>
                    <Input
                      id="paymentCode"
                      name="paymentCode"
                      type="text"
                      placeholder="VD: MB123"
                      defaultValue={session.paymentCode ?? ""}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="paymentNote">Ghi chú</FieldLabel>
                    <Textarea
                      id="paymentNote"
                      name="paymentNote"
                      placeholder="Ví dụ: Nội dung chuyển khoản..."
                      defaultValue={session.paymentNote ?? ""}
                    />
                  </Field>
                </FieldGroup>

                {paymentState.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{paymentState.error}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter showCloseButton>
                  <Button type="submit" disabled={isUpdatingPayment}>
                    {isUpdatingPayment ? "Đang lưu..." : "Lưu"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-4 md:grid-cols-[140px_1fr]">
          <div>
            {session.paymentQrUrl ? (
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="block overflow-hidden rounded-md border"
              >
                <img
                  src={session.paymentQrUrl}
                  alt="QR thanh toán"
                  className="h-30 w-30 object-cover"
                />
              </button>
            ) : (
              <div className="flex h-30 w-30 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                Chưa có QR
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Mã chuyển khoản:</span>
              <span>{session.paymentCode || "Chưa có"}</span>
              {session.paymentCode && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyPaymentCode}
                >
                  {copied ? (
                    <>
                      <Check className="size-4" /> Đã copy
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" /> Copy
                    </>
                  )}
                </Button>
              )}
            </div>
            <p className="text-muted-foreground">
              {session.paymentNote || "Chưa có ghi chú thanh toán."}
            </p>
          </div>
        </div>

        {!isHost && isOfficialParticipant && (
          <div className="space-y-3 rounded-md border border-dashed p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={
                  normalizedPaymentStatus === "PAID"
                    ? "bg-green-600 text-white hover:bg-green-600"
                    : normalizedPaymentStatus === "PENDING_REVIEW"
                      ? "bg-yellow-500 text-black hover:bg-yellow-500"
                      : ""
                }
                variant={
                  normalizedPaymentStatus === "UNPAID" ? "outline" : undefined
                }
              >
                {normalizedPaymentStatus}
              </Badge>
              <p className="text-muted-foreground">
                {normalizedPaymentStatus === "UNPAID"
                  ? "Bạn chưa xác nhận thanh toán."
                  : normalizedPaymentStatus === "PENDING_REVIEW"
                    ? "Đã gửi xác nhận, đang chờ host duyệt."
                    : "Thanh toán đã được host xác nhận."}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>QR thanh toán</DialogTitle>
          </DialogHeader>
          {session.paymentQrUrl ? (
            <div className="overflow-hidden rounded-md border">
              <img
                src={session.paymentQrUrl}
                alt="QR thanh toán phóng to"
                className="h-auto w-full object-contain"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có QR để hiển thị.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
