"use client"

import { GoogleLogin } from "@react-oauth/google"
import { useState } from "react"
import { toast } from "sonner"

import { loginWithGoogleAction } from "../actions/google"

export function GoogleAuthButton({
  text,
}: {
  text: "signin_with" | "signup_with"
}) {
  const [, setIsPending] = useState(false)

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const idToken = credentialResponse.credential
        if (!idToken) {
          toast.error("Không nhận được thông tin xác thực từ Google.")
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
        toast.error("Không thể xác thực với Google. Vui lòng thử lại.")
      }}
      useOneTap={false}
      text={text}
    />
  )
}
