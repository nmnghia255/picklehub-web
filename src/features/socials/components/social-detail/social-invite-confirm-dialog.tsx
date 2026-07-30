"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
  acceptByInviteCodeAction,
  acceptDirectInvitationAction,
  declineDirectInvitationAction,
  previewInviteCodeAction,
} from "@/features/socials/actions/invitation-actions"
import type {
  InviteCodePreview,
  SocialDetail,
} from "@/features/socials/types/social"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import { isSocialStarted } from "../../utils"

interface SocialInviteConfirmDialogProps {
  /** inviteCode từ query param ?inviteCode= */
  inviteCode?: string | null
  /** invitationId từ query param ?invitationId= hoặc In-App notification */
  invitationId?: string | null
  socialId: string
  initialSocial?: SocialDetail | null
}

type DialogState = "loading" | "valid" | "expired" | "full" | "error"

export default function SocialInviteConfirmDialog({
  inviteCode,
  invitationId,
  socialId,
  initialSocial,
}: SocialInviteConfirmDialogProps) {
  const { t } = useSocialsTranslation()
  const router = useRouter()

  const [open, setOpen] = useState(() => Boolean(invitationId || inviteCode))
  const [dialogState, setDialogState] = useState<DialogState>(() =>
    invitationId ? "valid" : "loading"
  )
  const [preview, setPreview] = useState<InviteCodePreview | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  const social = preview?.social || initialSocial
  const isExpiredInvite = social ? isSocialStarted(social) : false
  const activeDialogState = isExpiredInvite ? "expired" : dialogState

  // ── Open dialog and fetch preview when inviteCode or invitationId is present ──
  useEffect(() => {
    if (invitationId || !inviteCode) return

    let isMounted = true
    previewInviteCodeAction(inviteCode)
      .then((data) => {
        if (!isMounted) return
        setPreview(data)

        if (data.status !== "PENDING") {
          setDialogState("expired")
          return
        }

        if (!data.social?.hasAvailableSlots) {
          setDialogState("full")
          return
        }

        setDialogState("valid")
      })
      .catch(() => {
        if (isMounted) setDialogState("error")
      })

    return () => {
      isMounted = false
    }
  }, [inviteCode, invitationId])

  // ── Remove query params from URL on close without navigation ────
  const handleClose = () => {
    setOpen(false)
    const url = new URL(window.location.href)
    url.searchParams.delete("inviteCode")
    url.searchParams.delete("invitationId")
    window.history.replaceState({}, "", url.toString())
  }

  // ── Decline direct invitation ─────────────────────────────────
  const handleDecline = async () => {
    if (invitationId) {
      try {
        await declineDirectInvitationAction(invitationId, socialId)
        toast.success(t("invitation.declineSuccess", "Đã từ chối lời mời"))
      } catch {
        toast.error(t("invitation.declineError", "Từ chối lời mời thất bại"))
      }
    }
    handleClose()
    router.refresh()
  }

  // ── Accept via invite code or direct invitation ────────────────
  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      if (invitationId) {
        await acceptDirectInvitationAction(invitationId, socialId)
      } else if (inviteCode) {
        await acceptByInviteCodeAction(inviteCode, socialId)
      }
      toast.success(
        t("invitation.acceptSuccess", "Đã chấp nhận lời mời tham gia!")
      )
      handleClose()
      router.refresh()
    } catch (err: unknown) {
      console.error("[social-invite] Accept error:", err)
      const rawMsg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "invitation.acceptError"
      const translatedMsg = rawMsg.startsWith("invitation.")
        ? t(rawMsg)
        : rawMsg
      toast.error(translatedMsg)
    } finally {
      setIsAccepting(false)
    }
  }

  if (!inviteCode && !invitationId) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {activeDialogState === "loading" ? (
              <Loader2 className="size-5 animate-spin text-primary" />
            ) : activeDialogState === "valid" ? (
              <CheckCircle2 className="size-5 text-emerald-500" />
            ) : (
              <AlertCircle className="size-5 text-amber-500" />
            )}
            {t("invitation.confirmTitle")}
          </DialogTitle>

          {activeDialogState !== "loading" && social && (
            <DialogDescription>
              {t("invitation.confirmDescription", { title: social.title })}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* ── Loading ── */}
        {activeDialogState === "loading" && (
          <div className="flex justify-center py-6 text-sm text-muted-foreground">
            {t("invitation.loadingPreview")}
          </div>
        )}

        {/* ── Valid: show event info ── */}
        {activeDialogState === "valid" && social && (
          <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-medium">{social.title}</span>
            </div>

            {social.startTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4 shrink-0" />
                <span>
                  {format(new Date(social.startTime), "EEEE, dd/MM/yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>
            )}

            {social.startTime && social.endTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>
                  {format(new Date(social.startTime), "HH:mm")} –{" "}
                  {format(new Date(social.endTime), "HH:mm")}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span
                className={
                  social.hasAvailableSlots
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive"
                }
              >
                {social.hasAvailableSlots
                  ? `✓ ${t("invitation.confirmSlotAvailable")}`
                  : `✗ ${t("invitation.confirmSlotFull")}`}
              </span>
            </div>
          </div>
        )}

        {/* ── Expired / Cancelled ── */}
        {activeDialogState === "expired" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            {t("invitation.confirmExpired")}
          </div>
        )}

        {/* ── Session full ── */}
        {activeDialogState === "full" && social && (
          <div className="space-y-2">
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="font-medium">{social.title}</p>
            </div>
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {t("invitation.confirmSlotFull")}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {activeDialogState === "error" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {t("invitation.previewError")}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isAccepting}
          >
            {t("invitation.declineButton")}
          </Button>

          {activeDialogState === "valid" && (
            <Button
              onClick={handleAccept}
              disabled={isAccepting}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("invitation.loadingPreview")}
                </>
              ) : (
                t("invitation.acceptButton")
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
