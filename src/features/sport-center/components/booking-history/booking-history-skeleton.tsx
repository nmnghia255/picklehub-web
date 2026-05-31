import { Card, CardContent } from "@/components/ui/card"

export function BookingHistorySkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border bg-background/90 shadow-sm backdrop-blur">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,220px)_minmax(0,220px)_auto] md:items-end">
          <div className="h-10 rounded-md bg-muted/70" />
          <div className="h-10 rounded-md bg-muted/70" />
          <div className="h-10 rounded-md bg-muted/70 md:w-32 md:justify-self-end" />
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="space-y-px">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-4 border-b p-4 md:grid-cols-6 md:items-center"
            >
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-muted/70" />
                <div className="h-3 w-56 rounded bg-muted/60" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-muted/70" />
                <div className="h-3 w-20 rounded bg-muted/60" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted/70" />
                <div className="h-3 w-44 rounded bg-muted/60" />
              </div>
              <div className="h-4 w-24 rounded bg-muted/70" />
              <div className="h-4 w-32 rounded bg-muted/70" />
              <div className="h-7 w-28 rounded-full bg-muted/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
