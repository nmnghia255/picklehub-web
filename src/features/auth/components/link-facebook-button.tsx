"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { linkFacebookAction } from "../actions/facebook"
import { useFacebookLogin } from "../hooks/use-facebook-login"

export function LinkFacebookButton() {
  const { getFacebookAccessToken } = useFacebookLogin()
  const [loading, setLoading] = useState(false)

  const handleFacebookLink = async () => {
    try {
      setLoading(true)

      // 1. Get Facebook access token
      const accessToken = await getFacebookAccessToken()
      if (!accessToken) {
        toast.error("Không nhận được thông tin xác thực từ Facebook.")
        return
      }

      // 2. Link with backend
      const result = await linkFacebookAction(accessToken)
      if (result.success) {
        toast.success(result.message ?? "Đã liên kết tài khoản Facebook.")
      } else {
        toast.error(result.error ?? "Liên kết thất bại.")
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
      className="w-full sm:w-auto"
      disabled={loading}
      onClick={handleFacebookLink}
    >
      {loading ? "Đang xử lý..." : "Liên kết Facebook"}
    </Button>
  )
}
