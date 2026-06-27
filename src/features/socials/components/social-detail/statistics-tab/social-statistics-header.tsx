"use client"

import React from "react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

export function SocialStatisticsHeader() {
  const { t } = useSocialsTranslation()

  return (
    <Card className="overflow-hidden border-primary/10 bg-linear-to-br from-background via-background to-primary/5 shadow-sm">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("statistics.title", { defaultValue: "Post-Event Statistics" })}
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            {t("statistics.subtitle", {
              defaultValue:
                "Review matches played, total expenses, and actual revenue earned for this completed social.",
            })}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}
