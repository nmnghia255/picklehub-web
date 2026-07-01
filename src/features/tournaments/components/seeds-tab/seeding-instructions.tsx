import { Card, CardContent } from "@/components/ui/card"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

export function SeedingInstructions() {
  const { t } = useTournamentTranslation()

  return (
    <Card className="mt-6">
      <CardContent className="px-6 py-2">
        <div className="space-y-2 text-sm text-gray-600">
          <p className="font-medium text-gray-900">
            {t("seeding.instructions.title")}
          </p>
          <ul className="ml-2 list-inside list-disc space-y-1">
            <li>{t("seeding.instructions.item1")}</li>
            <li>{t("seeding.instructions.item2")}</li>
            <li>{t("seeding.instructions.item3")}</li>
            <li>{t("seeding.instructions.item4")}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
