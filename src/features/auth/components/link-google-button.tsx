"use client"

import { GoogleLogin } from "@react-oauth/google"
import { toast } from "sonner"

import { linkGoogleAction } from "../actions/google"

export function LinkGoogleButton() {
  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const idToken = credentialResponse.credential
        if (!idToken) {
          toast.error("Không nhận được thông tin xác thực từ Google.")
          return
        }
        const result = await linkGoogleAction(idToken)
        if (result.success) {
          toast.success(result.message ?? "Đã liên kết tài khoản Google.")
        } else {
          toast.error(result.error ?? "Liên kết thất bại.")
        }
      }}
      onError={() => {
        toast.error("Không thể xác thực với Google. Vui lòng thử lại.")
      }}
      useOneTap={false}
      text="continue_with"
    />
  )
}
