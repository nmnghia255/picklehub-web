import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useSportCenterTranslation } from "@/i18n/use-sport-center-translation"

type Props = {
  note: string
  onNoteChange: (note: string) => void
}

export function BookingNote({ note, onNoteChange }: Props) {
  const { t } = useSportCenterTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("booking.note.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder={t("booking.note.placeholder")}
          className="min-h-24"
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
        />
      </CardContent>
    </Card>
  )
}
