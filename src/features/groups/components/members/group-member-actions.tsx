"use client"

import { Loader2, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import { kickMemberAction, leaveGroupAction } from "../../actions"
import { useGroupInvalidation } from "../../api/groups-client"

function normalizeRole(role: string | null | undefined) {
  return role?.toLowerCase() ?? ""
}

interface KickMemberDialogProps {
  groupId: string
  memberId: string
  memberName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function KickMemberDialog({
  groupId,
  memberId,
  memberName,
  open,
  onOpenChange,
}: KickMemberDialogProps) {
  const { t } = useGroupsTranslation()
  const invalidation = useGroupInvalidation(groupId)
  const formRef = useRef<HTMLFormElement>(null)
  const handledSuccessRef = useRef(false)
  const [state, formAction, isPending] = useActionState(kickMemberAction, {})

  useEffect(() => {
    if (state.success && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      toast.success(
        t("errors.kickMemberSuccess", "Đã xóa {{name}} khỏi nhóm.", {
          name: memberName,
        })
      )
      void invalidation.invalidateMembers()
      onOpenChange(false)
    }

    if (state.error) {
      handledSuccessRef.current = false
      toast.error(t(state.error, state.error))
    }
  }, [memberName, invalidation, state.error, state.success, t, onOpenChange])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("dashboard.kickMemberTitle", "Xác nhận đuổi thành viên")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "dashboard.kickMemberDesc",
              "Bạn có chắc chắn muốn đuổi thành viên {{name}} khỏi nhóm không? Hành động này không thể hoàn tác.",
              { name: memberName }
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t("activitySchedule.btnCancel", "Hủy")}
          </AlertDialogCancel>
          <form ref={formRef} action={formAction}>
            <input type="hidden" name="groupId" value={groupId} />
            <input type="hidden" name="userId" value={memberId} />
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault()
                formRef.current?.requestSubmit()
              }}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("dashboard.kickMemberAction", "Đuổi thành viên")}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface LeaveGroupButtonProps {
  groupId: string
}

export function LeaveGroupButton({ groupId }: LeaveGroupButtonProps) {
  const { t } = useGroupsTranslation()
  const router = useRouter()
  const handledSuccessRef = useRef(false)
  const [state, formAction, isPending] = useActionState(leaveGroupAction, {})

  useEffect(() => {
    if (state.success && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      router.replace("/groups")
    }

    if (state.error) {
      handledSuccessRef.current = false
      toast.error(t(state.error, state.error))
    }
  }, [router, state.error, state.success, t])

  return (
    <form action={formAction}>
      <input type="hidden" name="groupId" value={groupId} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          t("dashboard.leaveGroupConfirmBtn", "Rời nhóm")
        )}
      </Button>
    </form>
  )
}

interface GroupMemberActionsProps {
  groupId: string
  memberId: string
  memberName: string
  memberRole: string
  currentUserId: string
  currentUserRole: string
  isEditable?: boolean
}

export function GroupMemberActions({
  groupId,
  memberId,
  memberName,
  memberRole,
  currentUserId,
  currentUserRole,
  isEditable = true,
}: GroupMemberActionsProps) {
  const { t } = useGroupsTranslation()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const normalizedCurrentRole = normalizeRole(currentUserRole)
  const normalizedMemberRole = normalizeRole(memberRole)
  const isSelf = memberId === currentUserId

  const canKick =
    isEditable &&
    !isSelf &&
    normalizedCurrentRole === "owner" &&
    normalizedMemberRole !== "owner"

  if (!canKick) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canKick && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setIsConfirmOpen(true)}
            >
              {t("dashboard.kickMemberAction", "Đuổi thành viên")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <KickMemberDialog
        groupId={groupId}
        memberId={memberId}
        memberName={memberName}
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
      />
    </div>
  )
}
