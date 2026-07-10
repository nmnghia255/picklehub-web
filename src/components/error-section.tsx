"use client"

import { AlertCircle } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorSectionProps {
  title?: string
  message: string
  className?: string
}

export function ErrorSection({ title, message, className }: ErrorSectionProps) {
  const { t } = useTranslation("common")

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="size-4" />
      <AlertTitle>{title ?? t("errorState.title")}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
