"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

interface PolicyTabProps {
  rules: string[]
}

export function PolicyTab({ rules }: PolicyTabProps) {
  const { t } = useSportCenterTranslation()
  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-3 p-6">
        <h2 className="text-lg font-semibold">{t("detail.tabs.policy")}</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {rules.map((item) => (
            <li key={item} className="rounded-lg border px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
