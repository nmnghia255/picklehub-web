"use client"

import { Link2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
import {
  type DuprActionState,
  linkDuprAction,
} from "@/features/profile/actions/dupr-actions"
import { useProfileTranslation } from "@/i18n/use-profile-translation"

function translateMessage(
  message: string | undefined,
  t: (key: string) => string
): string {
  if (!message) return ""
  return message.startsWith("duprCard.") ? t(message) : message
}

export function LinkDuprDialog({
  defaultFullName,
  defaultEmail,
}: {
  defaultFullName?: string
  defaultEmail?: string
}) {
  const { t } = useProfileTranslation()
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<
    DuprActionState,
    FormData
  >(linkDuprAction, {})

  useEffect(() => {
    if (state.success) {
      toast.success(translateMessage(state.message, t))
      router.refresh()
    }
  }, [state.success, state.message, router, t])

  const errorText = translateMessage(state.error, t)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Link2 className="size-4" />
          {t("duprCard.linkAction")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("duprCard.link.title")}</DialogTitle>
          <DialogDescription>
            {t("duprCard.link.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            startTransition(() => formAction(formData))
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="dupr-fullName">
                {t("duprCard.link.fullName")}
              </FieldLabel>
              <Input
                id="dupr-fullName"
                name="fullName"
                defaultValue={defaultFullName ?? ""}
                placeholder={t("duprCard.link.fullNamePlaceholder")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dupr-email">
                {t("duprCard.link.email")}
              </FieldLabel>
              <Input
                id="dupr-email"
                name="email"
                type="email"
                defaultValue={defaultEmail ?? ""}
                placeholder={t("duprCard.link.emailPlaceholder")}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="dupr-isoCode">
                  {t("duprCard.link.country")}
                </FieldLabel>
                <Input
                  id="dupr-isoCode"
                  name="isoCode"
                  maxLength={2}
                  placeholder={t("duprCard.link.countryPlaceholder")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="dupr-phone">
                  {t("duprCard.link.phone")}
                </FieldLabel>
                <Input
                  id="dupr-phone"
                  name="phone"
                  placeholder={t("duprCard.link.phonePlaceholder")}
                />
              </Field>
            </div>

            {errorText && <p className="text-sm text-red-600">{errorText}</p>}
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? t("duprCard.link.submitting")
                : t("duprCard.link.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
