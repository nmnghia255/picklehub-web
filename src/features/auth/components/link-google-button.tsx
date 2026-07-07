"use client"

import { GoogleLogin } from "@react-oauth/google"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { linkGoogleAction } from "../actions/google"

export function LinkGoogleButton() {
  const { t } = useTranslation("common")
  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const idToken = credentialResponse.credential
        if (!idToken) {
          toast.error(t("auth.oauth.googleError"))
          return
        }
        const result = await linkGoogleAction(idToken)
        if (result.success) {
          toast.success(result.message ?? t("auth.oauth.linkGoogleSuccess"))
        } else {
          toast.error(result.error ?? t("auth.oauth.linkFailed"))
        }
      }}
      onError={() => {
        toast.error(t("auth.oauth.googleErrorGeneric"))
      }}
      useOneTap={false}
      text="continue_with"
    />
  )
}
