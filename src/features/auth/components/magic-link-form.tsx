"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { startTransition, useActionState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { sendMagicLinkAction } from "@/features/auth/actions"
import { cn } from "@/lib/utils"

import { type MagicLinkFormData, magicLinkSchema } from "../schemas"

export function MagicLinkForm({ className }: { className?: string }) {
  const [state, formAction, isPending] = useActionState(sendMagicLinkAction, {})

  const form = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    const fd = new FormData()
    fd.set("email", data.email)
    startTransition(() => formAction(fd))
  })

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Đăng nhập bằng Magic Link</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Nhập Email của bạn, chúng tôi sẽ gửi link đăng nhập tức thì.
          </p>
        </div>

        {state.success ? (
          <div className="rounded-md border border-green-200 bg-green-50 p-3">
            <p className="text-sm text-green-700">{state.message}</p>
          </div>
        ) : (
          <>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="hoten@example.com"
                {...form.register("email")}
                aria-invalid={!!form.formState.errors.email}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </Field>

            {state.error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            )}

            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang gửi..." : "Gửi Magic Link"}
              </Button>
            </Field>
          </>
        )}

        <Field>
          <FieldDescription className="text-center">
            <Link href="/login" className="underline underline-offset-4">
              Quay lại đăng nhập
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
