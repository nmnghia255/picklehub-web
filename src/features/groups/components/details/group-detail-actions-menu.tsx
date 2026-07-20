"use client"

import {
  Archive,
  Loader2,
  LogOut,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OpenChatButton } from "@/features/chat/components/open-chat-button"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import {
  archiveGroupAction,
  leaveGroupAction,
  restoreGroupAction,
} from "../../actions"
import { useActionGuard } from "../../hooks/use-action-guard"
import type { Group } from "../../types"

interface GroupDetailActionsMenuProps {
  group: Group
  isOwner: boolean
  isArchived: boolean
}

export function GroupDetailActionsMenu({
  group,
  isOwner,
  isArchived,
}: GroupDetailActionsMenuProps) {
  const { t } = useGroupsTranslation()
  const { t: tCommon } = useTranslation("common")
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)

  const [restoreOpen, setRestoreOpen] = useState(false)

  const { guardWriteAction, PermissionDialog } = useActionGuard(
    group,
    group.role
  )

  const groupId = group.id
  const groupName = group.name

  return (
    <>
      {!isArchived && (
        <OpenChatButton
          kind="group"
          targetId={groupId}
          label={tCommon("chat.actions.openGroup")}
          className="border border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          size="sm"
          onClick={(e, trigger) => {
            guardWriteAction(trigger, {
              featureName: "nhắn tin nhóm",
            })
          }}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="size-9 shrink-0">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">
              {t("dashboard.openGroupActions", "Mở thao tác nhóm")}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          {!isArchived && isOwner && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                guardWriteAction(() => setArchiveOpen(true), {
                  featureName: "lưu trữ nhóm",
                })
              }}
            >
              <Archive className="size-4" />
              {t("dashboard.archiveGroupBtn", "Lưu trữ nhóm")}
            </DropdownMenuItem>
          )}
          {isArchived && isOwner && (
            <DropdownMenuItem onSelect={() => setRestoreOpen(true)}>
              <RotateCcw className="size-4" />
              {t("dashboard.restoreGroupBtn", "Khôi phục nhóm")}
            </DropdownMenuItem>
          )}
          {!isOwner && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setLeaveOpen(true)}
            >
              <LogOut className="size-4" />
              {t("dashboard.leaveGroupBtn", "Rời nhóm")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ArchiveGroupConfirmDialog
        groupId={groupId}
        groupName={groupName}
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
      />
      <RestoreGroupConfirmDialog
        groupId={groupId}
        groupName={groupName}
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
      />
      <LeaveGroupConfirmDialog
        groupId={groupId}
        groupName={groupName}
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
      />
      <PermissionDialog />
    </>
  )
}

function ArchiveGroupConfirmDialog({
  groupId,
  groupName,
  open,
  onOpenChange,
}: {
  groupId: string
  groupName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useGroupsTranslation()
  const router = useRouter()
  const handledSuccessRef = useRef(false)
  const [state, formAction, isPending] = useActionState(
    archiveGroupAction.bind(null, groupId),
    {}
  )
  const [archiveConfirmChecked, setArchiveConfirmChecked] = useState(false)

  useEffect(() => {
    if (open) {
      handledSuccessRef.current = false
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setArchiveConfirmChecked(false)
    }
  }, [open])

  useEffect(() => {
    if (state.success && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      toast.success(
        t("errors.archiveGroupSuccess", 'Đã lưu trữ nhóm "{{name}}".', {
          name: groupName,
        })
      )
      setTimeout(() => {
        onOpenChange(false)
        router.push("/groups")
      }, 500)
    }

    if (state.error) {
      handledSuccessRef.current = false
      toast.error(t(state.error, state.error))
    }
  }, [groupName, onOpenChange, state.error, state.success, t, router])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.archiveGroupDialogTitle", "Lưu trữ nhóm")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "dashboard.archiveGroupActionsDesc",
                'Bạn có chắc muốn lưu trữ nhóm "{{name}}" không? Thao tác này chỉ ẩn nhóm khỏi danh sách hoạt động.',
                { name: groupName }
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/50 p-3 dark:border-rose-900/50 dark:bg-rose-950/40">
              <Checkbox
                id="confirm-archive"
                checked={archiveConfirmChecked}
                onCheckedChange={(checked) =>
                  setArchiveConfirmChecked(!!checked)
                }
                className="mt-0.5 border-rose-300 data-[state=checked]:bg-destructive data-[state=checked]:text-white dark:border-rose-700"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="confirm-archive"
                  className="cursor-pointer text-xs font-bold text-rose-900 select-none dark:text-rose-200"
                >
                  {t(
                    "dashboard.archiveGroupCheckLabel",
                    "Tôi xác nhận muốn lưu trữ nhóm này."
                  )}
                </label>
                <p className="text-[10px] text-rose-700 dark:text-rose-300">
                  {t(
                    "dashboard.archiveGroupCheckDesc",
                    "Toàn bộ thành viên và thông tin nhóm sẽ không thể tương tác cho đến khi được khôi phục."
                  )}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter showCloseButton={false} className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t("activitySchedule.btnCancel")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending || !archiveConfirmChecked}
            >
              {isPending
                ? t("dashboard.archivingGroupBtn", "Đang lưu trữ...")
                : t("dashboard.archiveGroupActionBtn", "Lưu trữ")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LeaveGroupConfirmDialog({
  groupId,
  groupName,
  open,
  onOpenChange,
}: {
  groupId: string
  groupName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useGroupsTranslation()
  const handledSuccessRef = useRef(false)
  const [state, formAction, isPending] = useActionState(leaveGroupAction, {})

  useEffect(() => {
    if (open) {
      handledSuccessRef.current = false
    }
  }, [open])

  useEffect(() => {
    if (state.success && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      toast.success(
        t("errors.leaveGroupSuccess", 'Đã rời nhóm "{{name}}".', {
          name: groupName,
        })
      )
      setTimeout(() => onOpenChange(false), 0)
    }

    if (state.error) {
      handledSuccessRef.current = false
      toast.error(t(state.error, state.error))
    }
  }, [groupName, onOpenChange, state.error, state.success, t])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <form action={formAction}>
          <input type="hidden" name="groupId" value={groupId} />
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.leaveGroupDialogTitle", "Rời nhóm")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "dashboard.leaveGroupDialogDesc",
                'Bạn có chắc muốn rời khỏi nhóm "{{name}}" không?',
                { name: groupName }
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter showCloseButton={false} className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t("activitySchedule.btnCancel")}
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending
                ? t("dashboard.leavingGroupBtn", "Đang xử lý...")
                : t("dashboard.leaveGroupConfirmBtn", "Rời nhóm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RestoreGroupConfirmDialog({
  groupId,
  groupName,
  open,
  onOpenChange,
}: {
  groupId: string
  groupName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useGroupsTranslation()
  const handledSuccessRef = useRef(false)
  const [state, formAction, isPending] = useActionState(
    restoreGroupAction.bind(null, groupId),
    {}
  )
  const [restoreConfirmChecked, setRestoreConfirmChecked] = useState(false)

  useEffect(() => {
    if (open) {
      handledSuccessRef.current = false
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRestoreConfirmChecked(false)
    }
  }, [open])

  useEffect(() => {
    if (state.success && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      toast.success(
        t("dashboard.restoreGroupSuccess", 'Đã khôi phục nhóm "{{name}}".', {
          name: groupName,
        })
      )
      setTimeout(() => onOpenChange(false), 0)
    }

    if (state.error) {
      handledSuccessRef.current = false
      toast.error(t(state.error, state.error))
    }
  }, [groupName, onOpenChange, state.error, state.success, t])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.restoreGroupDialogTitle", "Khôi phục nhóm")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "dashboard.restoreGroupDialogDesc",
                'Bạn có chắc muốn khôi phục nhóm "{{name}}" không? Nhóm sẽ quay lại hoạt động bình thường.',
                { name: groupName }
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/40">
              <Checkbox
                id="confirm-restore"
                checked={restoreConfirmChecked}
                onCheckedChange={(checked) =>
                  setRestoreConfirmChecked(!!checked)
                }
                className="mt-0.5 border-emerald-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white dark:border-emerald-700"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="confirm-restore"
                  className="cursor-pointer text-xs font-bold text-emerald-900 select-none dark:text-emerald-200"
                >
                  {t(
                    "dashboard.restoreGroupCheckLabel",
                    "Tôi xác nhận muốn khôi phục nhóm này."
                  )}
                </label>
              </div>
            </div>
          </div>

          <DialogFooter showCloseButton={false} className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t("activitySchedule.btnCancel")}
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={!restoreConfirmChecked || isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {isPending
                ? t("dashboard.restoringGroupBtn", "Đang khôi phục...")
                : t("dashboard.restoreGroupActionBtn", "Khôi phục")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
