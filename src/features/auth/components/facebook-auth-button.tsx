"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { loginWithFacebookAction } from "../actions/facebook"
import { useFacebookLogin } from "../hooks/use-facebook-login"

export function FacebookAuthButton({ title }: { title: string }) {
  const { getFacebookAccessToken } = useFacebookLogin()
  const [loading, setLoading] = useState(false)

  const handleFacebookLogin = async () => {
    try {
      setLoading(true)

      // 1. Get Facebook access token
      const accessToken = await getFacebookAccessToken()
      if (!accessToken) {
        toast.error("Không nhận được thông tin xác thực từ Facebook.")
        return
      }

      // 2. Send access token to backend for authentication
      const result = await loginWithFacebookAction(accessToken)
      if (result?.error) {
        toast.error(result.error)
      }
    } catch (err) {
      console.error(err)
      toast.error("Không thể xác thực với Facebook. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      type="button"
      disabled={loading}
      onClick={handleFacebookLogin}
    >
      {loading ? "Đang xử lý..." : title}
    </Button>
  )
}
