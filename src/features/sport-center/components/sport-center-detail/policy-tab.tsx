import { Card, CardContent } from "@/components/ui/card"

interface PolicyTabProps {
  rules: string[]
}

export function PolicyTab({ rules }: PolicyTabProps) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-3 p-6">
        <h2 className="text-lg font-semibold">Điều khoản & quy định</h2>
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
