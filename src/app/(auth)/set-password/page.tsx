import { FieldGroup } from "@/components/ui/field"
import { AuthBrandLink } from "@/features/auth/components/auth-brand-link"
import { SetPasswordForm } from "@/features/auth/components/set-password-form"

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string }>
}) {
  const { groupId } = await searchParams

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <AuthBrandLink />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex flex-col gap-6">
              <FieldGroup>
                <SetPasswordForm groupId={groupId} />
              </FieldGroup>
            </div>
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
