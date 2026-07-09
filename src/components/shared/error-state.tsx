"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorStateProps {
  title?: string
  description?: string
  retry?: () => void
}

export function ErrorState({ title, description, retry }: ErrorStateProps) {
  const { t } = useTranslation("common")

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="mb-4 size-12 text-destructive" />
        <p className="mb-2 text-lg font-medium">
          {title ?? t("errorState.title")}
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          {description ?? t("errorState.description")}
        </p>
        {retry && (
          <Button variant="outline" onClick={retry}>
            <RefreshCw className="mr-2 size-4" />
            {t("errorState.retry")}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
