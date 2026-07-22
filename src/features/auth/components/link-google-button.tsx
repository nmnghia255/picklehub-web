"use client"

import { GoogleLogin } from "@react-oauth/google"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { useProfileTranslation } from "@/i18n/use-profile-translation"

import { linkGoogleAction } from "../actions/google"
import { translateAuthMessage } from "../utils"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export function LinkGoogleButton() {
  const { t: tCommon } = useTranslation("common")
  const { t: tProfile } = useProfileTranslation()
  const [isPending, setIsPending] = useState(false)

  return (
    <div className="relative flex h-10 w-full overflow-hidden">
      {/* Visual Button */}
      <button
        type="button"
        disabled={isPending}
        className="relative flex h-10 w-full cursor-pointer items-center justify-center rounded-[4px] border border-[#dadce0] bg-white px-3 text-sm font-normal text-[#3c4043] transition-colors hover:bg-[#f8f9fa] disabled:opacity-50"
      >
        <div className="absolute left-3.5 flex items-center justify-center">
          <GoogleIcon />
        </div>
        <span>
          {isPending
            ? tCommon("auth.oauth.loading")
            : tProfile("edit.continueWithGoogle")}
        </span>
      </button>

      {/* Invisible Interactive Google Login Component */}
      <div className="absolute inset-0 z-10 cursor-pointer overflow-hidden opacity-0 [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:opacity-0 [&>div]:h-full [&>div]:w-full">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            const idToken = credentialResponse.credential
            if (!idToken) {
              toast.error(tCommon("auth.oauth.googleError"))
              return
            }
            setIsPending(true)
            const result = await linkGoogleAction(idToken)
            setIsPending(false)
            if (result.success) {
              toast.success(
                translateAuthMessage(
                  tCommon,
                  result.message ?? tCommon("auth.oauth.linkGoogleSuccess")
                )
              )
            } else {
              toast.error(
                translateAuthMessage(
                  tCommon,
                  result.error ?? tCommon("auth.oauth.linkFailed")
                )
              )
            }
          }}
          onError={() => {
            toast.error(tCommon("auth.oauth.googleErrorGeneric"))
          }}
          useOneTap={false}
          width="100%"
        />
      </div>
    </div>
  )
}
