import { redirect } from "next/navigation"

import { AuthBrandLink } from "@/features/auth/components/auth-brand-link"
import { RegisterForm } from "@/features/auth/components/register-form"
import { getSession } from "@/lib/session"

export default async function RegisterPage() {
  const session = await getSession()
  if (session.user) {
    redirect("/")
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <AuthBrandLink />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/images/auth-bg.webp"
          alt="auth-bg"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
