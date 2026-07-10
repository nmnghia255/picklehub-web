"use client"

import { useState } from "react"
import { toast } from "sonner"

import { useProfileTranslation } from "@/i18n/use-profile-translation"

import { linkFacebookAction } from "../actions/facebook"
import { useFacebookLogin } from "../hooks/use-facebook-login"

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]">
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
  const { getFacebookAccessToken } = useFacebookLogin()
  const [loading, setLoading] = useState(false)
  const { t } = useProfileTranslation()

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
    <button
      type="button"
      disabled={loading}
      onClick={handleFacebookLink}
      className="relative flex h-10 w-full cursor-pointer items-center justify-center rounded-[4px] border border-[#dadce0] bg-white px-3 text-sm font-medium text-[#3c4043] transition-colors hover:bg-[#f8f9fa] disabled:opacity-50"
    >
      <div className="absolute left-3 flex items-center justify-center">
        <FacebookIcon />
      </div>
      <span className="font-normal">
        {loading ? "Đang xử lý..." : t("edit.continueWithFacebook")}
      </span>
    </button>
  )
}
