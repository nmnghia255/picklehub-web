"use client"

import {
  BoxIcon,
  CheckCircleIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { verifyMagicLinkAction } from "@/features/auth/actions"

type State = "loading" | "success" | "error"

const MISSING_MAGIC_MESSAGE =
  "Link đăng nhập không hợp lệ. Vui lòng yêu cầu link mới."

export function MagicLinkVerifyClient({ magic }: { magic?: string }) {
  const router = useRouter()
  const [state, setState] = useState<State>(() =>
    !magic ? "error" : "loading"
  )
  const [errorMessage, setErrorMessage] = useState(() =>
    !magic ? MISSING_MAGIC_MESSAGE : ""
  )

  useEffect(() => {
    if (!magic) return

    verifyMagicLinkAction(magic).then((result) => {
      if (result.error) {
        setErrorMessage(result.error)
        setState("error")
        return
      }

      setState("success")
      router.push("/")
    })
  }, [magic, router])

  return (
    <Layout>
      {state === "loading" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2Icon className="size-8 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Đang xác thực...</h1>
            <p className="text-sm text-muted-foreground">
              Vui lòng chờ trong giây lát.
            </p>
          </div>
        </div>
      )}

      {state === "success" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircleIcon className="size-8 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Đăng nhập thành công!</h1>
            <p className="text-sm text-muted-foreground">
              Đang chuyển hướng...
            </p>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10">
            <XCircleIcon className="size-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Xác thực thất bại</h1>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Field>
            <Link href="/magic-link" className="w-full">
              <Button className="w-full">Gửi lại Magic Link</Button>
            </Link>
          </Field>
        </div>
      )}
    </Layout>
  )
}

const Layout = ({ children }: { children: React.ReactNode }) => (
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
            <FieldGroup>{children}</FieldGroup>
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
