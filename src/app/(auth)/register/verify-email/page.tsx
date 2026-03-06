"use client"

import { BoxIcon, MailIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useActionState } from "react"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { resendVerificationAction } from "@/features/auth/actions"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [state, formAction, isPending] = useActionState(
    resendVerificationAction,
    {}
  )

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BoxIcon className="size-4" />
            </div>
            PickleHub
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex flex-col gap-6">
              <FieldGroup>
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <MailIcon className="size-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold">
                      Kiểm tra email của bạn
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Chúng tôi đã gửi email xác thực đến
                    </p>
                    {email && <p className="text-sm font-medium">{email}</p>}
                    <p className="text-sm text-muted-foreground">
                      Vui lòng kiểm tra hộp thư và nhấn vào link xác thực để
                      hoàn tất đăng ký.
                    </p>
                  </div>
                </div>

                {state.success && (
                  <p className="text-center text-sm text-green-600">
                    {state.message}
                  </p>
                )}

                {state.error && (
                  <p className="text-center text-sm text-red-500">
                    {state.error}
                  </p>
                )}

                <Field>
                  <form action={formAction}>
                    <input type="hidden" name="email" value={email} />
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={!email || isPending}
                      className="w-full"
                    >
                      {isPending ? "Đang gửi lại..." : "Gửi lại email xác thực"}
                    </Button>
                  </form>
                </Field>

                <div className="text-center text-sm text-muted-foreground">
                  Đã xác thực email?{" "}
                  <Link
                    href="/login"
                    className="font-medium underline underline-offset-4"
                  >
                    Đăng nhập
                  </Link>
                </div>
              </FieldGroup>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
