"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { linkFacebookAction } from "../actions/facebook"
import { useFacebookLogin } from "../hooks/use-facebook-login"

export function LinkFacebookButton() {
  const { t } = useTranslation("common")
  const { getFacebookAccessToken } = useFacebookLogin()
  const [loading, setLoading] = useState(false)

  const handleFacebookLink = async () => {
    try {
      setLoading(true)

      const accessToken = await getFacebookAccessToken()
      if (!accessToken) {
        toast.error(t("auth.oauth.facebookError"))
        return
      }

      const result = await linkFacebookAction(accessToken)
      if (result.success) {
        toast.success(result.message ?? t("auth.oauth.linkFacebookSuccess"))
      } else {
        toast.error(result.error ?? t("auth.oauth.linkFailed"))
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
      className="w-full sm:w-auto"
      disabled={loading}
      onClick={handleFacebookLink}
    >
      {loading ? t("auth.oauth.loading") : t("auth.oauth.linkFacebook")}
    </Button>
  )
}
