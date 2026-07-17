"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { useProfileTranslation } from "@/i18n/use-profile-translation"

import { linkFacebookAction } from "../actions/facebook"
import { useFacebookLogin } from "../hooks/use-facebook-login"
import { translateAuthMessage } from "../utils"

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path
        fill="#FFFFFF"
        transform="translate(0.5, 0)"
        d="M13.4 8.3h1.8V5.9h-2.1c-2.3 0-3.5 1.4-3.5 3.6v1.8H8v2.4h1.6v4.4h2.6v-4.4h2l.4-2.4h-2.4V9.8c0-.8.2-1.5 1.2-1.5z"
      />
    </svg>
  )
}

export function LinkFacebookButton() {
  const { t: tCommon } = useTranslation("common")
  const { t: tProfile } = useProfileTranslation()
  const { getFacebookAccessToken } = useFacebookLogin()
  const [loading, setLoading] = useState(false)

  const handleFacebookLink = async () => {
    try {
      setLoading(true)

      const accessToken = await getFacebookAccessToken()
      if (!accessToken) {
        toast.error(tCommon("auth.oauth.facebookError"))
        return
      }

      const result = await linkFacebookAction(accessToken)
      if (result.success) {
        toast.success(
          translateAuthMessage(
            tCommon,
            result.message ?? tCommon("auth.oauth.linkFacebookSuccess")
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
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        toast.error(translateAuthMessage(tCommon, err.message))
      } else {
        toast.error(tCommon("auth.oauth.facebookErrorGeneric"))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      aria-busy={loading}
      onClick={handleFacebookLink}
      className="relative flex h-10 w-full cursor-pointer items-center justify-center rounded-[4px] border border-[#dadce0] bg-white px-4 text-sm font-normal text-[#3c4043] transition-colors hover:bg-[#f8f9fa] disabled:opacity-50"
    >
      <div className="absolute left-4 flex items-center justify-center">
        <FacebookIcon />
      </div>
      <span>
        {loading
          ? tCommon("auth.oauth.loading")
          : tProfile("edit.continueWithFacebook")}
      </span>
    </button>
  )
}
