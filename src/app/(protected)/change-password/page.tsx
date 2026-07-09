import { BoxIcon } from "lucide-react"
import Link from "next/link"

import { FieldGroup } from "@/components/ui/field"
import { ChangePasswordForm } from "@/features/auth/components/change-password-form"

export default function ChangePasswordPage() {
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
                <ChangePasswordForm />
              </FieldGroup>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
