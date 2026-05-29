import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  note: string
  onNoteChange: (note: string) => void
}

export function BookingNote({ note, onNoteChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ghi chú đặt sân</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Ghi chú tùy chọn cho nhân viên sân (thiết bị, số lượng người chơi, yêu cầu...)"
          className="min-h-24"
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
        />
      </CardContent>
    </Card>
  )
}
