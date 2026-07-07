"use client"

import { GoogleLogin } from "@react-oauth/google"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { loginWithGoogleAction } from "../actions/google"

export function GoogleAuthButton({
  text,
}: {
  text: "signin_with" | "signup_with"
}) {
  const { t } = useTranslation("common")
  const [, setIsPending] = useState(false)

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const idToken = credentialResponse.credential
        if (!idToken) {
          toast.error(t("auth.oauth.googleError"))
          return
        }
        setIsPending(true)
        const result = await loginWithGoogleAction(idToken)
        setIsPending(false)
        if (result?.error) {
          toast.error(result.error)
        }
      }}
      onError={() => {
        toast.error(t("auth.oauth.googleErrorGeneric"))
      }}
      useOneTap={false}
      text={text}
    />
  )
}
