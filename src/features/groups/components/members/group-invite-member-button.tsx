"use client"

import { Mail } from "lucide-react"
import { useActionState, useEffect, useRef, useState } from "react"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import { type GroupActionState, inviteToGroupAction } from "../../actions"
import { useGroupDetail, useGroupInvalidation } from "../../api/groups-client"
import { useActionGuard } from "../../hooks/use-action-guard"

interface GroupInviteMemberButtonProps {
  groupId: string
  groupName: string
}

export function GroupInviteMemberButton({
  groupId,
  groupName,
}: GroupInviteMemberButtonProps) {
  const { t } = useGroupsTranslation()
  const [open, setOpen] = useState(false)

  const { data: group } = useGroupDetail(groupId)

  const { guardWriteAction, PermissionDialog } = useActionGuard(
    group,
    group?.role
  )

  return (
    <>
      <Button
        onClick={() => {
          guardWriteAction(() => setOpen(true), {
            featureName: "mời thành viên mới",
          })
        }}
        size="sm"
        className="border border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <Mail className="size-4" />
        {t("dashboard.inviteMemberBtn", "Mời thành viên")}
      </Button>

      <InviteMemberDialog
        groupId={groupId}
        groupName={groupName}
        open={open}
        onOpenChange={setOpen}
      />

      <PermissionDialog />
    </>
  )
}

function InviteMemberDialog({
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
  const invalidation = useGroupInvalidation(groupId)
  const lastStateRef = useRef<GroupActionState | null>(null)
  const [state, formAction, isPending] = useActionState(
    inviteToGroupAction.bind(null, groupId),
    {}
  )

  useEffect(() => {
    if (state !== lastStateRef.current) {
      lastStateRef.current = state

      if (state.success) {
        toast.success(
          t(
            "errors.inviteMemberSuccess",
            'Đã gửi lời mời vào nhóm "{{name}}".',
            { name: groupName }
          )
        )
        void invalidation.invalidateInvitations()
        setTimeout(() => onOpenChange(false), 0)
      }

      if (state.error) {
        toast.error(t(state.error, state.error))
      }
    }
  }, [groupName, onOpenChange, invalidation, state, t])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.inviteMemberBtn", "Mời thành viên")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "dashboard.inviteMemberDesc",
                'Gửi lời mời qua email để thêm người vào nhóm "{{name}}".',
                { name: groupName }
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="invite-email">
                  {t("activitySchedule.formFieldEmail", "Email")}
                </FieldLabel>
                <Input
                  id="invite-email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                />
              </Field>
            </FieldGroup>
            {state.error && (
              <p className="mt-2 text-sm text-destructive">
                {t(state.error, state.error)}
              </p>
            )}
          </div>

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending} variant="orangeCard">
              {isPending
                ? t("dashboard.sendingInvitationBtn", "Đang gửi...")
                : t("dashboard.sendInvitationBtn", "Gửi lời mời")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
