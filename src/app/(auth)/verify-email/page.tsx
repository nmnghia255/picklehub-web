import axios from "axios"
import { BoxIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || ""

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-yellow-500/10">
            <XCircleIcon className="size-8 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Thiếu token</h1>
            <p className="text-sm text-muted-foreground">
              Link xác thực không hợp lệ. Vui lòng kiểm tra lại email của bạn.
            </p>
          </div>
          <Field>
            <Link href="/register" className="w-full">
              <Button className="w-full">Quay lại đăng ký</Button>
            </Link>
          </Field>
        </div>
      </Layout>
    )
  }

  let errorMessage: string | null = null

  try {
    await axios.post(`${API_BASE_URL}/api/auth/verify-email`, { token })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.message ||
        "Xác thực thất bại. Link có thể đã hết hạn."
    } else {
      errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại."
    }
  }

  if (errorMessage) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10">
            <XCircleIcon className="size-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Xác thực thất bại</h1>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Field>
            <Link href="/register" className="w-full">
              <Button className="w-full">Đăng ký lại</Button>
            </Link>
          </Field>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2Icon className="size-8 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Xác thực thành công!</h1>
          <p className="text-sm text-muted-foreground">
            Email của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.
          </p>
        </div>
        <Field>
          <Link href="/login" className="w-full">
            <Button className="w-full">Đăng nhập ngay</Button>
          </Link>
        </Field>
      </div>
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
