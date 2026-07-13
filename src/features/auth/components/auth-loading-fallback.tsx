"use client"

import { useTranslation } from "react-i18next"

export function AuthLoadingFallback() {
  const { t } = useTranslation("common")

  return <div>{t("auth.registerVerifyEmail.loading")}</div>
}
