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

import { inviteToGroupAction } from "../actions"

interface GroupInviteMemberButtonProps {
  groupId: string
  groupName: string
}

export function GroupInviteMemberButton({
  groupId,
  groupName,
}: GroupInviteMemberButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Mail className="size-4" />
        Mời thành viên
      </Button>

      <InviteMemberDialog
        groupId={groupId}
        groupName={groupName}
        open={open}
        onOpenChange={setOpen}
      />
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
  const handledSuccessRef = useRef(false)
  const [state, formAction, isPending] = useActionState(
    inviteToGroupAction.bind(null, groupId),
    {}
  )

  useEffect(() => {
    if (state.success && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      toast.success(`Đã gửi lời mời vào nhóm "${groupName}".`)
      setTimeout(() => onOpenChange(false), 0)
    }

    if (state.error) {
      handledSuccessRef.current = false
      toast.error(state.error)
    }
  }, [groupName, onOpenChange, state.error, state.success])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Mời thành viên</DialogTitle>
            <DialogDescription>
              Gửi lời mời qua email để thêm người vào nhóm &quot;{groupName}
              &quot;.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                <Input
                  id="invite-email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                />
              </Field>
            </FieldGroup>
            {state.error && (
              <p className="mt-2 text-sm text-destructive">{state.error}</p>
            )}
          </div>

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang gửi..." : "Gửi lời mời"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
