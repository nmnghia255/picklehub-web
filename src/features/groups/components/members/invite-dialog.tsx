"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useGroupsTranslation } from "@/i18n/use-groups-translation"

import { inviteToGroupAction } from "../../actions"
import { type InviteFormData, inviteSchema } from "../../schemas"

interface InviteDialogProps {
  groupId: string
}

export function InviteDialog({ groupId }: InviteDialogProps) {
  const { t } = useGroupsTranslation()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    inviteToGroupAction.bind(null, groupId),
    {}
  )

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "" },
  })

  useEffect(() => {
    if (!state.success) return
    const id = setTimeout(() => {
      setOpen(false)
      form.reset()
      router.refresh()
    })
    return () => clearTimeout(id)
  }, [form, router, state.success])

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData()
    fd.set("email", data.email)
    startTransition(() => formAction(fd))
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="size-4" />
          {t("dashboard.inviteByEmailBtn", "Mời qua email")}
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.inviteByEmailTitle", "Mời thành viên qua Email")}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">
                  {t("activitySchedule.formFieldEmail", "Email")}
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...form.register("email")}
                  aria-invalid={!!form.formState.errors.email}
                />
                {form.formState.errors.email?.message && (
                  <p className="text-sm text-destructive">
                    {t(form.formState.errors.email.message)}
                  </p>
                )}
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
