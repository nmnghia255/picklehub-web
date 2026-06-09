"use client"

import { Plus, Trash2 } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSocialsTranslation } from "@/i18n/use-socials-translation"

import Field from "../social-detail/field"
export interface PlaySessionDraft {
  title: string
  startTime: string
  endTime: string
  maxSlots: number
}
export function SocialFormPlaySessionsCard({
  playSessions,
  setPlaySessions,
  startTime,
  endTime,
}: {
  playSessions: PlaySessionDraft[]
  setPlaySessions: Dispatch<SetStateAction<PlaySessionDraft[]>>
  startTime: string
  endTime: string
}) {
  const { t } = useSocialsTranslation()

  const addPlaySession = () => {
    setPlaySessions((prev) => [
      ...prev,
      {
        title: "",
        startTime,
        endTime,
        maxSlots: 16,
      },
    ])
  }

  const removePlaySession = (index: number) => {
    setPlaySessions((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index)
    )
  }

  const updatePlaySession = (
    index: number,
    field: keyof PlaySessionDraft,
    value: string | number
  ) => {
    setPlaySessions((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  return (
    <Card className="p-0">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            {t("form.playSessions")} ({playSessions.length})
          </h2>
          <Button variant="outline" onClick={addPlaySession}>
            <Plus className="size-4" />
            {t("form.addPlaySession")}
          </Button>
        </div>

        {playSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-sm text-muted-foreground">
            {t("form.addPlaySessionsHint")}
          </div>
        ) : (
          <div className="space-y-4">
            {playSessions.map((session, index) => (
              <Card key={index} className="p-0">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold">
                      {t("form.sessionTitle")} {index + 1}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removePlaySession(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <Field label={t("form.sessionTitle")}>
                    <Input
                      value={session.title}
                      onChange={(e) =>
                        updatePlaySession(index, "title", e.target.value)
                      }
                      placeholder={t("form.sessionTitlePlaceholder")}
                    />
                  </Field>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label={t("form.maxSlots")}>
                      <Input
                        type="number"
                        value={session.maxSlots}
                        onChange={(e) =>
                          updatePlaySession(
                            index,
                            "maxSlots",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min={1}
                      />
                    </Field>
                    <Field label={t("form.startTime")}>
                      <Input
                        type="datetime-local"
                        value={session.startTime}
                        onChange={(e) =>
                          updatePlaySession(index, "startTime", e.target.value)
                        }
                      />
                    </Field>
                    <Field label={t("form.endTime")}>
                      <Input
                        type="datetime-local"
                        value={session.endTime}
                        onChange={(e) =>
                          updatePlaySession(index, "endTime", e.target.value)
                        }
                      />
                    </Field>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
