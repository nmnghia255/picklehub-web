"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { loginWithFacebookAction } from "../actions/facebook"
import { useFacebookLogin } from "../hooks/use-facebook-login"

export function FacebookAuthButton({ title }: { title: string }) {
  const { t } = useTranslation("common")
  const { getFacebookAccessToken } = useFacebookLogin()
  const [loading, setLoading] = useState(false)

  const handleFacebookLogin = async () => {
    try {
      setLoading(true)

      const accessToken = await getFacebookAccessToken()
      if (!accessToken) {
        toast.error(t("auth.oauth.facebookError"))
        return
      }

      const result = await loginWithFacebookAction(accessToken)
      if (result?.error) {
        toast.error(result.error)
      }
    } catch (err) {
      console.error(err)
      toast.error(t("auth.oauth.facebookErrorGeneric"))
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
      {loading ? t("auth.oauth.loading") : title}
    </Button>
  )
}
