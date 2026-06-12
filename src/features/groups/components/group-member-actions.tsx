"use client"

import { Loader2, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useRef } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  changeMemberRoleAction,
  kickMemberAction,
  leaveGroupAction,
} from "../actions"
import { useGroupInvalidation } from "../api/groups-client"

function normalizeRole(role: string | null | undefined) {
  return role?.toLowerCase() ?? ""
}

interface RoleChangeMenuItemProps {
  groupId: string
  memberId: string
  memberName: string
  currentRole: string
}

function RoleChangeMenuItem({
  groupId,
  memberId,
  memberName,
  currentRole,
}: RoleChangeMenuItemProps) {
  const invalidation = useGroupInvalidation(groupId)
  const formRef = useRef<HTMLFormElement>(null)
  const handledSuccessRef = useRef(false)
  const targetRole = currentRole === "admin" ? "MEMBER" : "ADMIN"
  const [state, formAction, isPending] = useActionState(
    changeMemberRoleAction,
    {}
  )

  useEffect(() => {
    if (state.success && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      toast.success(`Đã cập nhật vai trò của ${memberName}.`)
      void invalidation.invalidateMembers()
    }

    if (state.error) {
      handledSuccessRef.current = false
      toast.error(state.error)
    }
  }, [memberName, invalidation, state.error, state.success])

  return (
    <form ref={formRef} action={formAction} className="contents">
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="memberId" value={memberId} />
      <input type="hidden" name="role" value={targetRole} />
      <DropdownMenuItem
        disabled={isPending}
        onClick={() => {
          formRef.current?.requestSubmit()
        }}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : currentRole === "admin" ? (
          "Xóa vai trò quản trị viên"
        ) : (
          "Chuyển thành quản trị viên"
        )}
      </DropdownMenuItem>
    </form>
  )
}

interface KickMemberMenuItemProps {
  groupId: string
  memberId: string
  memberName: string
}

function KickMemberMenuItem({
  groupId,
  memberId,
  memberName,
}: KickMemberMenuItemProps) {
  const invalidation = useGroupInvalidation(groupId)
  const formRef = useRef<HTMLFormElement>(null)
  const handledSuccessRef = useRef(false)
  const [state, formAction, isPending] = useActionState(kickMemberAction, {})

  useEffect(() => {
    if (state.success && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      toast.success(`Đã xóa ${memberName} khỏi nhóm.`)
      void invalidation.invalidateMembers()
    }

    if (state.error) {
      handledSuccessRef.current = false
      toast.error(state.error)
    }
  }, [memberName, invalidation, state.error, state.success])

  return (
    <form ref={formRef} action={formAction} className="contents">
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="userId" value={memberId} />
      <DropdownMenuItem
        disabled={isPending}
        variant="destructive"
        onClick={() => {
          formRef.current?.requestSubmit()
        }}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          "Đuổi thành viên"
        )}
      </DropdownMenuItem>
    </form>
  )
}

interface LeaveGroupButtonProps {
  groupId: string
}

export function LeaveGroupButton({ groupId }: LeaveGroupButtonProps) {
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
      toast.error(state.error)
    }
  }, [router, state.error, state.success])

  return (
    <form action={formAction}>
      <input type="hidden" name="groupId" value={groupId} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        disabled={isPending}
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Rời nhóm"}
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
  const normalizedCurrentRole = normalizeRole(currentUserRole)
  const normalizedMemberRole = normalizeRole(memberRole)
  const isSelf = memberId === currentUserId

  const canChangeRole =
    isEditable &&
    normalizedCurrentRole === "owner" &&
    !isSelf &&
    normalizedMemberRole !== "owner"
  const canKick =
    isEditable &&
    !isSelf &&
    ((normalizedCurrentRole === "owner" && normalizedMemberRole !== "owner") ||
      (normalizedCurrentRole === "admin" && normalizedMemberRole === "member"))

  if (!canChangeRole && !canKick) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {(canChangeRole || canKick) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canChangeRole && (
              <RoleChangeMenuItem
                groupId={groupId}
                memberId={memberId}
                memberName={memberName}
                currentRole={normalizedMemberRole}
              />
            )}
            {canKick && (
              <KickMemberMenuItem
                groupId={groupId}
                memberId={memberId}
                memberName={memberName}
              />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
