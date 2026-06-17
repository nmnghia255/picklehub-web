import { GripVertical, Lock, Shuffle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { seeds } from "../mock-data/seeding"

export function Seeding() {
  const { t } = useTournamentTranslation()
  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-semibold text-gray-900">
                {t("seeding.title")}
              </h1>
              <p className="text-gray-600">{t("seeding.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Shuffle className="mr-2 h-4 w-4" />
                {t("seeding.autoSeed")}
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Lock className="mr-2 h-4 w-4" />
                {t("seeding.lockSeeding")}
              </Button>
            </div>
          </div>
        </div>

        {/* Seeding Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("seeding.table.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-16">
                    {t("seeding.table.seed")}
                  </TableHead>
                  <TableHead>{t("seeding.table.team")}</TableHead>
                  <TableHead>{t("seeding.table.rating")}</TableHead>
                  <TableHead>{t("seeding.table.record")}</TableHead>
                  <TableHead>{t("seeding.table.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seeds.map((seed) => (
                  <TableRow key={seed.seed} className="hover:bg-gray-50">
                    <TableCell>
                      <GripVertical className="h-4 w-4 cursor-grab text-gray-400" />
                    </TableCell>
                    <TableCell>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 font-bold text-emerald-600">
                        #{seed.seed}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {seed.team}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold">
                        {seed.rating}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {seed.wins}W - {seed.losses}L
                    </TableCell>
                    <TableCell>
                      {seed.status === "locked" ? (
                        <Badge className="bg-gray-100 text-gray-700">
                          <Lock className="mr-1 h-3 w-3" />
                          {t("seeding.table.locked")}
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700">
                          {t("seeding.table.unlocked")}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardContent className="p-6">
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
      </div>
    </div>
  )
}
